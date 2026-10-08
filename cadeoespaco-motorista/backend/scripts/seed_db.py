"""
Popula o banco com dados iniciais.
Uso: python -m scripts.seed_db
"""
import asyncio
import os
import uuid
import random
from datetime import datetime, timedelta, timezone

import libsql_client
from dotenv import load_dotenv

load_dotenv()

URL = os.getenv("TURSO_DATABASE_URL", "file:local.db")
TOKEN = os.getenv("TURSO_AUTH_TOKEN", "")

EMPRESAS = [
    ("E1", "Sinnob", "00.000.000/0001-01"),
    ("E2", "Sao Jose", "00.000.000/0001-02"),
    ("E3", "Vitoria", "00.000.000/0001-03"),
]

LINHAS = [
    ("L1", "101", "Parangaba/Messejana", "E1"),
    ("L2", "205", "Centro/Antonio Bezerra", "E2"),
    ("L3", "312", "Aldeota/Papicu", "E3"),
    ("L4", "401", "Messejana/Centro", "E1"),
    ("L5", "502", "Conjunto Ceara/Centro", "E2"),
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

COORDS = {
    "L1": (-3.7520, -38.5450),
    "L2": (-3.7320, -38.5700),
    "L3": (-3.7420, -38.4850),
    "L4": (-3.7900, -38.5100),
    "L5": (-3.7320, -38.5800),
}

MOTORISTA_ID = "M001"


async def main():
    kwargs = {"url": URL}
    if TOKEN:
        kwargs["auth_token"] = TOKEN

    print(f"Conectando em: {URL}")
    async with libsql_client.create_client(**kwargs) as client:

        for t in ("relatos", "veiculos", "linhas", "usuarios", "empresas"):
            await client.execute(f"DELETE FROM {t}")

        for e in EMPRESAS:
            await client.execute(
                "INSERT INTO empresas (id, nome, cnpj) VALUES (?, ?, ?)", e
            )
        print(f"OK: {len(EMPRESAS)} empresas")

        for l in LINHAS:
            await client.execute(
                "INSERT INTO linhas (id, codigo, nome, empresa_id) VALUES (?, ?, ?, ?)",
                l,
            )
        print(f"OK: {len(LINHAS)} linhas")

        for v in VEICULOS:
            await client.execute(
                "INSERT INTO veiculos (id, placa, numero_carro, linha_id, empresa_id) VALUES (?, ?, ?, ?, ?)",
                v,
            )
        print(f"OK: {len(VEICULOS)} veiculos")

        await client.execute(
            "INSERT INTO usuarios (id, nome, email, senha_hash, tipo, empresa_id) VALUES (?, ?, ?, ?, ?, ?)",
            (MOTORISTA_ID, "Joao Silva", "joao@sinnob.com", "mock", "motorista", "E1"),
        )
        print("OK: motorista mock (M001)")

        PERFIL = [0.5, 1, 2.2, 2.5, 1.5, 1, 1.1, 1.4, 1.3, 1, 1.1, 1.5, 2.3, 2.6, 2, 1.3, 0.8, 0.6, 0.4]
        FATOR = {"L1": 1.4, "L2": 0.8, "L3": 0.55, "L4": 1.2, "L5": 1.0}

        agora = datetime.now(timezone.utc)
        total_relatos = 0

        for dia in range(7):
            for hora_offset, base in enumerate(PERFIL):
                hora_real = 5 + hora_offset
                for linha_id, fator in FATOR.items():
                    if random.random() < 0.35:
                        continue
                    nivel = min(3, max(0, round(base * fator + random.uniform(-0.3, 0.3))))
                    lat, lng = COORDS[linha_id]
                    lat += random.uniform(-0.005, 0.005)
                    lng += random.uniform(-0.005, 0.005)

                    ts = (agora - timedelta(days=dia)).replace(
                        hour=hora_real, minute=random.randint(0, 59), second=0
                    )

                    veiculo = next(v for v in VEICULOS if v[3] == linha_id)
                    await client.execute(
                        """
                        INSERT INTO relatos
                          (id, usuario_id, veiculo_id, linha_id, nivel_lotacao,
                           latitude, longitude, velocidade_kmh, sentido, origem, criado_em)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            str(uuid.uuid4()),
                            MOTORISTA_ID,
                            veiculo[0],
                            linha_id,
                            nivel,
                            lat,
                            lng,
                            round(random.uniform(0, 60), 1),
                            random.choice(["ida", "volta"]),
                            "motorista",
                            ts.isoformat(),
                        ),
                    )
                    total_relatos += 1

        print(f"OK: {total_relatos} relatos sinteticos")
        print("Seed concluido.")


if __name__ == "__main__":
    asyncio.run(main())
