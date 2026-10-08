"""
seed_turso.py — Popula o Turso com dados realistas do CadêOEspaço.

- Usa a HTTP API do Turso (httpx) — não depende de libsql-client.
- Coordenadas e rotas extraídas do mockGeo.js (Fortaleza/CE).
- Perfil horário do mockData.js (picos em 7h-8h e 17h-19h).
- Gera ~500 relatos dos últimos 7 dias para o dashboard nascer com dados.

Uso:
    python seed_turso.py
    python seed_turso.py --limpar        (apaga tudo antes)
    python seed_turso.py --dias 30       (gera 30 dias de histórico)
"""

import argparse
import asyncio
import os
import random
import uuid
from datetime import datetime, timedelta, timezone

import httpx
from dotenv import load_dotenv

load_dotenv()

TURSO_URL = os.getenv("TURSO_DATABASE_URL", "").replace("libsql://", "https://")
TURSO_TOKEN = os.getenv("TURSO_AUTH_TOKEN", "")


# ==================================================================
# Cliente HTTP mínimo para o Turso (pipeline v2)
# ==================================================================

def _to_arg(value):
    if value is None:
        return {"type": "null"}
    if isinstance(value, bool):
        return {"type": "integer", "value": str(int(value))}
    if isinstance(value, int):
        return {"type": "integer", "value": str(value)}
    if isinstance(value, float):
        return {"type": "float", "value": value}
    return {"type": "text", "value": str(value)}


async def turso_execute(sql, params=()):
    payload = {
        "requests": [
            {"type": "execute", "stmt": {"sql": sql, "args": [_to_arg(p) for p in params]}},
            {"type": "close"},
        ]
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            f"{TURSO_URL}/v2/pipeline",
            headers={
                "Authorization": f"Bearer {TURSO_TOKEN}",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        resp.raise_for_status()
        data = resp.json()

    first = data["results"][0]
    if first.get("type") != "ok":
        erro = first.get("error", {})
        raise RuntimeError(f"Turso: {erro.get('message', erro)}")
    return first["response"]["result"]


# ==================================================================
# Dados base — extraídos dos mocks do dashboard
# ==================================================================

EMPRESAS = [
    ("E1", "Sinnob", "00.000.000/0001-01"),
    ("E2", "São José", "00.000.000/0001-02"),
    ("E3", "Vitória", "00.000.000/0001-03"),
]

LINHAS = [
    ("L1", "101", "Parangaba/Messejana", "E1"),
    ("L2", "205", "Centro/Antônio Bezerra", "E2"),
    ("L3", "312", "Aldeota/Papicu", "E3"),
    ("L4", "401", "Messejana/Centro", "E1"),
    ("L5", "502", "Conjunto Ceará/Centro", "E2"),
]

VEICULOS = [
    ("V001", "ABC-1A23", "101-01", "L1", "E1"),
    ("V002", "ABC-2B34", "101-02", "L1", "E1"),
    ("V003", "XYZ-3C45", "205-01", "L2", "E2"),
    ("V004", "XYZ-4D56", "205-02", "L2", "E2"),
    ("V005", "DEF-5E67", "312-01", "L3", "E3"),
    ("V006", "GHI-6F78", "401-01", "L4", "E1"),
    ("V007", "JKL-7G89", "502-01", "L5", "E2"),
]

# Rotas reais (de mockGeo.js) — usadas para gerar pontos ao longo do trajeto
ROTAS = {
    "L1": [
        (-3.7442, -38.5588),  # Terminal Parangaba
        (-3.7520, -38.5450),  # Av. João Pessoa
        (-3.7650, -38.5350),  # Av. Aguanambi
        (-3.7900, -38.5100),  # Av. Washington Soares
        (-3.8290, -38.4890),  # Terminal Messejana
    ],
    "L2": [
        (-3.7320, -38.5950),
        (-3.7320, -38.5700),
        (-3.7300, -38.5500),
        (-3.7270, -38.5260),
    ],
    "L3": [
        (-3.7410, -38.5010),
        (-3.7420, -38.4850),
        (-3.7450, -38.4700),
    ],
    "L4": [
        (-3.8290, -38.4890),
        (-3.7900, -38.5100),
        (-3.7650, -38.5350),
        (-3.7270, -38.5260),
    ],
    "L5": [
        (-3.7500, -38.6200),
        (-3.7320, -38.5800),
        (-3.7320, -38.5600),
        (-3.7270, -38.5260),
    ],
}

# Perfil base (de mockData.js): picos em 7h-8h e 17h-19h
PERFIL_HORARIO = [
    0.5, 1.0, 2.2, 2.5, 1.5, 1.0, 1.1, 1.4, 1.3,
    1.0, 1.1, 1.5, 2.3, 2.6, 2.0, 1.3, 0.8, 0.6, 0.4,
]

# Fator multiplicador por linha (L1 é a mais crítica, L3 é a mais tranquila)
FATOR_LINHA = {
    "L1": 1.35,
    "L2": 0.80,
    "L3": 0.55,
    "L4": 1.20,
    "L5": 1.00,
}

# Precisão esperada em cada linha (usa o mockGeo como referência)
def ponto_na_rota(linha_id):
    """Sorteia um ponto aleatório entre os vértices da rota + ruído leve."""
    rota = ROTAS[linha_id]
    lat, lng = random.choice(rota)
    lat += random.uniform(-0.0025, 0.0025)
    lng += random.uniform(-0.0025, 0.0025)
    return round(lat, 6), round(lng, 6)


MOTORISTA_ID = "M001"


# ==================================================================
# DDL (create table if not exists)
# ==================================================================

DDL = [
    """CREATE TABLE IF NOT EXISTS empresas (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        cnpj TEXT UNIQUE
    )""",
    """CREATE TABLE IF NOT EXISTS usuarios (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha_hash TEXT NOT NULL,
        tipo TEXT NOT NULL CHECK (tipo IN ('motorista','cobrador','gestor','passageiro')),
        empresa_id TEXT REFERENCES empresas(id),
        criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    )""",
    """CREATE TABLE IF NOT EXISTS linhas (
        id TEXT PRIMARY KEY,
        codigo TEXT NOT NULL,
        nome TEXT NOT NULL,
        empresa_id TEXT REFERENCES empresas(id),
        ativa INTEGER NOT NULL DEFAULT 1
    )""",
    """CREATE TABLE IF NOT EXISTS veiculos (
        id TEXT PRIMARY KEY,
        placa TEXT UNIQUE NOT NULL,
        numero_carro TEXT,
        linha_id TEXT REFERENCES linhas(id),
        empresa_id TEXT REFERENCES empresas(id),
        ativo INTEGER NOT NULL DEFAULT 1
    )""",
    """CREATE TABLE IF NOT EXISTS relatos (
        id TEXT PRIMARY KEY,
        usuario_id TEXT REFERENCES usuarios(id),
        veiculo_id TEXT REFERENCES veiculos(id),
        linha_id TEXT REFERENCES linhas(id),
        nivel_lotacao INTEGER NOT NULL CHECK (nivel_lotacao BETWEEN 0 AND 3),
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        velocidade_kmh REAL,
        sentido TEXT CHECK (sentido IN ('ida','volta')),
        origem TEXT NOT NULL CHECK (origem IN ('motorista','passageiro','crowdsourcing')),
        criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    )""",
    "CREATE INDEX IF NOT EXISTS idx_relatos_linha_hora ON relatos(linha_id, criado_em)",
    "CREATE INDEX IF NOT EXISTS idx_relatos_criado_em ON relatos(criado_em)",
]


# ==================================================================
# Geração dos relatos sintéticos
# ==================================================================

def gerar_relatos(dias: int):
    """Gera uma lista de tuplas (id, usuario, veiculo, linha, nivel, lat, lng, vel, sentido, origem, criado_em)."""
    agora = datetime.now(timezone.utc)
    relatos = []

    # Mapeia veiculos por linha para escolher um a cada relato
    veiculos_por_linha = {}
    for v in VEICULOS:
        veiculos_por_linha.setdefault(v[3], []).append(v[0])

    for dia_offset in range(dias):
        for hora_idx, base in enumerate(PERFIL_HORARIO):
            hora_real = 5 + hora_idx  # 05h às 23h

            for linha_id, fator in FATOR_LINHA.items():
                # Nem toda hora tem relato — aproxima realidade esparsa
                # Linhas críticas têm mais relatos (2 a 4 por hora)
                # Linhas tranquilas têm 0 a 2
                peso = 0.55 + 0.35 * fator
                if random.random() > peso:
                    continue

                qtd = 1
                if fator >= 1.2:
                    qtd = random.choice([1, 2, 3])
                elif fator >= 0.9:
                    qtd = random.choice([1, 2])
                else:
                    qtd = 1

                for _ in range(qtd):
                    # Nível com base no perfil + fator da linha + ruído
                    base_ajustada = base * fator
                    ruido = random.uniform(-0.4, 0.4)
                    nivel_bruto = base_ajustada + ruido
                    nivel = min(3, max(0, round(nivel_bruto)))

                    # Pequena chance de outlier (ônibus atrasado = superlotado)
                    if random.random() < 0.03:
                        nivel = min(3, nivel + 1)

                    lat, lng = ponto_na_rota(linha_id)
                    veiculo_id = random.choice(veiculos_por_linha[linha_id])
                    velocidade = round(random.uniform(0, 65), 1)
                    sentido = random.choice(["ida", "volta"])

                    # Timestamp: hora exata + minuto aleatório dentro da hora
                    ts = (agora - timedelta(days=dia_offset)).replace(
                        hour=hora_real,
                        minute=random.randint(0, 59),
                        second=random.randint(0, 59),
                        microsecond=0,
                    )

                    relatos.append((
                        str(uuid.uuid4()),
                        MOTORISTA_ID,
                        veiculo_id,
                        linha_id,
                        nivel,
                        lat,
                        lng,
                        velocidade,
                        sentido,
                        "motorista",
                        ts.isoformat(),
                    ))

    return relatos


# ==================================================================
# Rotinas de inserção
# ==================================================================

async def limpar_tabelas():
    print("→ Limpando tabelas...")
    for t in ("relatos", "veiculos", "linhas", "usuarios", "empresas"):
        try:
            await turso_execute(f"DELETE FROM {t}")
            print(f"  [ok] {t} esvaziada")
        except Exception as e:
            print(f"  [aviso] {t}: {e}")


async def criar_schema():
    print("→ Criando schema (se não existir)...")
    for stmt in DDL:
        await turso_execute(stmt)
    print(f"  [ok] {len(DDL)} comandos executados")


async def inserir_base():
    print("→ Inserindo empresas...")
    for e in EMPRESAS:
        await turso_execute(
            "INSERT OR REPLACE INTO empresas (id, nome, cnpj) VALUES (?, ?, ?)", e
        )
    print(f"  [ok] {len(EMPRESAS)} empresas")

    print("→ Inserindo linhas...")
    for l in LINHAS:
        await turso_execute(
            "INSERT OR REPLACE INTO linhas (id, codigo, nome, empresa_id) VALUES (?, ?, ?, ?)",
            l,
        )
    print(f"  [ok] {len(LINHAS)} linhas")

    print("→ Inserindo veículos...")
    for v in VEICULOS:
        await turso_execute(
            "INSERT OR REPLACE INTO veiculos (id, placa, numero_carro, linha_id, empresa_id) VALUES (?, ?, ?, ?, ?)",
            v,
        )
    print(f"  [ok] {len(VEICULOS)} veículos")

    print("→ Inserindo motorista mock...")
    await turso_execute(
        "INSERT OR REPLACE INTO usuarios (id, nome, email, senha_hash, tipo, empresa_id) VALUES (?, ?, ?, ?, ?, ?)",
        (MOTORISTA_ID, "João Silva", "joao@sinnob.com", "mock", "motorista", "E1"),
    )
    print("  [ok] M001")


async def inserir_relatos(dias: int):
    relatos = gerar_relatos(dias)
    total = len(relatos)
    print(f"→ Inserindo {total} relatos (últimos {dias} dias)...")

    # Insere em lotes para não estourar o payload do Turso
    LOTE = 50
    inseridos = 0
    for i in range(0, total, LOTE):
        lote = relatos[i:i + LOTE]
        requests = []
        for r in lote:
            requests.append({
                "type": "execute",
                "stmt": {
                    "sql": (
                        "INSERT INTO relatos "
                        "(id, usuario_id, veiculo_id, linha_id, nivel_lotacao, "
                        "latitude, longitude, velocidade_kmh, sentido, origem, criado_em) "
                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
                    ),
                    "args": [_to_arg(p) for p in r],
                },
            })
        requests.append({"type": "close"})

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{TURSO_URL}/v2/pipeline",
                headers={
                    "Authorization": f"Bearer {TURSO_TOKEN}",
                    "Content-Type": "application/json",
                },
                json={"requests": requests},
            )
            resp.raise_for_status()
            data = resp.json()

        for res in data["results"][:-1]:
            if res.get("type") != "ok":
                print(f"  [erro] {res}")
                continue
            inseridos += 1

        progresso = min(i + LOTE, total)
        print(f"  [{progresso}/{total}] inseridos")

    print(f"  [ok] {inseridos} relatos")
    return inseridos


# ==================================================================
# Main
# ==================================================================

async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limpar", action="store_true", help="Apaga tudo antes de inserir")
    parser.add_argument("--dias", type=int, default=7, help="Dias de histórico (padrão: 7)")
    args = parser.parse_args()

    print()
    print("=" * 60)
    print("  CadêOEspaço · Seed do Turso")
    print(f"  URL: {TURSO_URL}")
    print(f"  Token: {'OK' if TURSO_TOKEN else 'AUSENTE'}")
    print(f"  Dias de histórico: {args.dias}")
    print("=" * 60)
    print()

    if not TURSO_TOKEN:
        print("ERRO: TURSO_AUTH_TOKEN ausente no .env")
        return

    try:
        await criar_schema()

        if args.limpar:
            await limpar_tabelas()

        await inserir_base()
        await inserir_relatos(args.dias)

        # Verificação final
        result = await turso_execute("SELECT COUNT(*) AS total FROM relatos")
        cols = [c["name"] for c in result.get("cols", [])]
        rows = result.get("rows", [])
        if rows:
            total = rows[0][0].get("value")
            print()
            print(f"✓ Total de relatos no banco: {total}")

        print()
        print("Seed concluído com sucesso.")

    except Exception as e:
        print()
        print(f"ERRO: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(main())
