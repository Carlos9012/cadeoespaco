"""
criar_arquivos.py — Cria toda a estrutura do back-end FastAPI.
Rode de dentro da pasta 'backend':
    python criar_arquivos.py
"""
from pathlib import Path

ARQUIVOS = {}

# ============================================================
# app/__init__.py
# ============================================================
ARQUIVOS["app/__init__.py"] = ""

# ============================================================
# app/config.py
# ============================================================
ARQUIVOS["app/config.py"] = '''from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    turso_database_url: str = "file:local.db"
    turso_auth_token: str = ""

    jwt_secret: str = "troque-este-segredo"
    jwt_algorithm: str = "HS256"
    jwt_expira_minutos: int = 480

    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
    ]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
'''

# ============================================================
# app/db.py
# ============================================================
ARQUIVOS["app/db.py"] = '''"""
Conexao com o Turso (SQLite distribuido) via libsql-client.
"""
import libsql_client
from typing import AsyncGenerator

from .config import settings


async def get_db() -> AsyncGenerator[libsql_client.Client, None]:
    kwargs = {"url": settings.turso_database_url}
    if settings.turso_auth_token:
        kwargs["auth_token"] = settings.turso_auth_token

    async with libsql_client.create_client(**kwargs) as client:
        yield client


def row_to_dict(row) -> dict:
    if hasattr(row, "_asdict"):
        return row._asdict()
    try:
        return dict(zip(row.keys(), row))
    except Exception:
        return dict(row)
'''

# ============================================================
# app/models.py
# ============================================================
ARQUIVOS["app/models.py"] = '''from pydantic import BaseModel, Field
from typing import Literal, Optional


class RelatoCreate(BaseModel):
    usuario_id: str
    veiculo_id: str
    linha_id: str
    nivel_lotacao: int = Field(..., ge=0, le=3)
    latitude: float
    longitude: float
    velocidade_kmh: Optional[float] = None
    sentido: Optional[Literal["ida", "volta"]] = None
    origem: Literal["motorista", "passageiro", "crowdsourcing"] = "motorista"


class Relato(BaseModel):
    id: str
    usuario_id: str
    veiculo_id: str
    linha_id: str
    nivel_lotacao: int
    latitude: float
    longitude: float
    velocidade_kmh: Optional[float] = None
    sentido: Optional[str] = None
    origem: str
    criado_em: str


class Linha(BaseModel):
    id: str
    codigo: str
    nome: str
    empresa_id: Optional[str] = None


class Veiculo(BaseModel):
    id: str
    placa: str
    numero_carro: Optional[str] = None
    linha_id: Optional[str] = None
'''

# ============================================================
# app/auth.py
# ============================================================
ARQUIVOS["app/auth.py"] = '''"""
Autenticacao JWT - PREPARADA, mas nao ativada.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from .config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def hash_senha(senha: str) -> str:
    return pwd_context.hash(senha)


def verificar_senha(senha: str, hash_senha: str) -> bool:
    return pwd_context.verify(senha, hash_senha)


def criar_token(data: dict, expira_minutos: Optional[int] = None) -> str:
    payload = data.copy()
    expira = datetime.now(timezone.utc) + timedelta(
        minutes=expira_minutos or settings.jwt_expira_minutos
    )
    payload.update({"exp": expira})
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


async def usuario_atual(token: Optional[str] = Depends(oauth2_scheme)) -> dict:
    if token is None:
        return {"id": "M001", "nome": "Joao Silva", "tipo": "motorista"}

    try:
        payload = jwt.decode(
            token, settings.jwt_secret, algorithms=[settings.jwt_algorithm]
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
'''

# ============================================================
# app/main.py
# ============================================================
ARQUIVOS["app/main.py"] = '''from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import auth, linhas, relatos, dashboard, recomendacoes

app = FastAPI(
    title="CadeOEspaco API",
    description="Back-end que alimenta o painel da empresa e recebe relatos do motorista.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(linhas.router, prefix="/api", tags=["linhas"])
app.include_router(relatos.router, prefix="/api", tags=["relatos"])
app.include_router(dashboard.router, prefix="/api", tags=["dashboard"])
app.include_router(recomendacoes.router, prefix="/api", tags=["recomendacoes"])


@app.get("/api/health", tags=["health"])
async def health():
    return {"status": "ok", "servico": "cadeoespaco-api"}
'''

# ============================================================
# app/routers/__init__.py
# ============================================================
ARQUIVOS["app/routers/__init__.py"] = ""

# ============================================================
# app/routers/auth.py
# ============================================================
ARQUIVOS["app/routers/auth.py"] = '''from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    senha: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: dict


@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest):
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Login ainda nao implementado. O front usa MOTORISTA_MOCK.",
    )


@router.get("/me")
async def me():
    return {
        "id": "M001",
        "nome": "Joao Silva",
        "matricula": "12345",
        "empresa": "Sinnob",
        "tipo": "motorista",
    }
'''

# ============================================================
# app/routers/linhas.py
# ============================================================
ARQUIVOS["app/routers/linhas.py"] = '''from fastapi import APIRouter, Depends, Query
from typing import Optional

import libsql_client

from ..db import get_db, row_to_dict

router = APIRouter()


@router.get("/linhas")
async def listar_linhas(db: libsql_client.Client = Depends(get_db)):
    result = await db.execute(
        "SELECT id, codigo, nome, empresa_id FROM linhas WHERE ativa = 1 ORDER BY codigo"
    )
    return [row_to_dict(r) for r in result.rows]


@router.get("/veiculos")
async def listar_veiculos(
    linha_id: Optional[str] = Query(None),
    db: libsql_client.Client = Depends(get_db),
):
    if linha_id:
        result = await db.execute(
            "SELECT id, placa, numero_carro, linha_id FROM veiculos WHERE ativo = 1 AND linha_id = ? ORDER BY numero_carro",
            (linha_id,),
        )
    else:
        result = await db.execute(
            "SELECT id, placa, numero_carro, linha_id FROM veiculos WHERE ativo = 1 ORDER BY numero_carro"
        )
    return [row_to_dict(r) for r in result.rows]
'''

# ============================================================
# app/routers/relatos.py
# ============================================================
ARQUIVOS["app/routers/relatos.py"] = '''import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query
from typing import Optional

import libsql_client

from ..db import get_db, row_to_dict
from ..models import RelatoCreate

router = APIRouter()


@router.post("/relatos", status_code=201)
async def criar_relato(
    payload: RelatoCreate,
    db: libsql_client.Client = Depends(get_db),
):
    relato_id = str(uuid.uuid4())
    criado_em = datetime.now(timezone.utc).isoformat()

    await db.execute(
        """
        INSERT INTO relatos
          (id, usuario_id, veiculo_id, linha_id, nivel_lotacao,
           latitude, longitude, velocidade_kmh, sentido, origem, criado_em)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            relato_id,
            payload.usuario_id,
            payload.veiculo_id,
            payload.linha_id,
            payload.nivel_lotacao,
            payload.latitude,
            payload.longitude,
            payload.velocidade_kmh,
            payload.sentido,
            payload.origem,
            criado_em,
        ),
    )

    return {"id": relato_id, "criado_em": criado_em}


@router.get("/relatos")
async def listar_relatos(
    linha_id: Optional[str] = Query(None),
    limite: int = Query(100, ge=1, le=1000),
    db: libsql_client.Client = Depends(get_db),
):
    if linha_id:
        result = await db.execute(
            """
            SELECT id, usuario_id, veiculo_id, linha_id, nivel_lotacao,
                   latitude, longitude, velocidade_kmh, sentido, origem, criado_em
            FROM relatos
            WHERE linha_id = ?
            ORDER BY criado_em DESC
            LIMIT ?
            """,
            (linha_id, limite),
        )
    else:
        result = await db.execute(
            """
            SELECT id, usuario_id, veiculo_id, linha_id, nivel_lotacao,
                   latitude, longitude, velocidade_kmh, sentido, origem, criado_em
            FROM relatos
            ORDER BY criado_em DESC
            LIMIT ?
            """,
            (limite,),
        )
    return [row_to_dict(r) for r in result.rows]
'''

# ============================================================
# app/routers/dashboard.py
# ============================================================
ARQUIVOS["app/routers/dashboard.py"] = '''from fastapi import APIRouter, Depends, Query
from datetime import datetime, timedelta, timezone

import libsql_client

from ..db import get_db

router = APIRouter()


def _periodo_para_data(periodo: str) -> str:
    agora = datetime.now(timezone.utc)
    if periodo == "hoje":
        inicio = agora.replace(hour=0, minute=0, second=0, microsecond=0)
    elif periodo == "7d":
        inicio = agora - timedelta(days=7)
    elif periodo == "30d":
        inicio = agora - timedelta(days=30)
    else:
        inicio = agora - timedelta(days=1)
    return inicio.isoformat()


@router.get("/lotacao/agregada")
async def lotacao_agregada(
    periodo: str = Query("hoje"),
    linha: str = Query("Todas"),
    db: libsql_client.Client = Depends(get_db),
):
    desde = _periodo_para_data(periodo)
    where = "WHERE criado_em >= ?"
    params: list = [desde]

    if linha != "Todas":
        where += " AND linha_id = ?"
        params.append(linha)

    sql = f"""
        SELECT
          substr(criado_em, 12, 2) AS hora,
          linha_id,
          AVG(nivel_lotacao) AS indice
        FROM relatos
        {where}
        GROUP BY hora, linha_id
        ORDER BY hora
    """
    result = await db.execute(sql, tuple(params))

    por_hora: dict[str, dict] = {}
    for r in result.rows:
        hora = f"{r['hora']}h"
        por_hora.setdefault(hora, {"hora": hora})
        por_hora[hora][r["linha_id"]] = round(float(r["indice"]), 2)

    return list(por_hora.values())


@router.get("/lotacao/ranking")
async def lotacao_ranking(
    periodo: str = Query("hoje"),
    linha: str = Query("Todas"),
    db: libsql_client.Client = Depends(get_db),
):
    desde = _periodo_para_data(periodo)
    where = "WHERE r.criado_em >= ?"
    params: list = [desde]

    if linha != "Todas":
        where += " AND r.linha_id = ?"
        params.append(linha)

    sql = f"""
        SELECT
          r.linha_id,
          l.nome,
          AVG(r.nivel_lotacao) AS indice,
          COUNT(*) AS relatos
        FROM relatos r
        JOIN linhas l ON l.id = r.linha_id
        {where}
        GROUP BY r.linha_id, l.nome
        ORDER BY indice DESC
    """
    result = await db.execute(sql, tuple(params))

    return [
        {
            "id": r["linha_id"],
            "nome": r["nome"],
            "indice": round(float(r["indice"]), 2),
            "relatos": int(r["relatos"]),
        }
        for r in result.rows
    ]


@router.get("/lotacao/trechos-criticos")
async def trechos_criticos(
    periodo: str = Query("hoje"),
    linha: str = Query("Todas"),
    limite: int = Query(5),
    db: libsql_client.Client = Depends(get_db),
):
    desde = _periodo_para_data(periodo)
    where = "WHERE criado_em >= ?"
    params: list = [desde]

    if linha != "Todas":
        where += " AND linha_id = ?"
        params.append(linha)

    sql = f"""
        SELECT
          linha_id,
          AVG(latitude) AS lat,
          AVG(longitude) AS lng,
          AVG(nivel_lotacao) AS indice,
          COUNT(*) AS relatos
        FROM relatos
        {where}
        GROUP BY linha_id
        ORDER BY indice DESC
        LIMIT ?
    """
    result = await db.execute(sql, tuple(params + [limite]))

    return [
        {
            "linha": r["linha_id"],
            "lat": float(r["lat"]),
            "lng": float(r["lng"]),
            "indice": round(float(r["indice"]), 2),
            "relatos": int(r["relatos"]),
        }
        for r in result.rows
    ]


@router.get("/kpis")
async def kpis(
    periodo: str = Query("hoje"),
    linha: str = Query("Todas"),
    db: libsql_client.Client = Depends(get_db),
):
    desde = _periodo_para_data(periodo)
    where = "WHERE criado_em >= ?"
    params: list = [desde]

    if linha != "Todas":
        where += " AND linha_id = ?"
        params.append(linha)

    sql_total = f"SELECT COUNT(*) AS total, AVG(nivel_lotacao) AS media FROM relatos {where}"
    res_total = await db.execute(sql_total, tuple(params))
    linha_total = res_total.rows[0]
    total = int(linha_total["total"] or 0)
    media = float(linha_total["media"] or 0)

    sql_super = f"SELECT COUNT(*) AS c FROM relatos {where} AND nivel_lotacao >= 2.5"
    res_super = await db.execute(sql_super, tuple(params))
    superlot = int(res_super.rows[0]["c"] or 0)

    sql_criticas = f"""
        SELECT COUNT(DISTINCT linha_id) AS c FROM (
          SELECT linha_id FROM relatos {where}
          GROUP BY linha_id HAVING AVG(nivel_lotacao) >= 2
        )
    """
    res_crit = await db.execute(sql_criticas, tuple(params))
    criticas = int(res_crit.rows[0]["c"] or 0)

    pct = (superlot / total * 100) if total else 0

    return {
        "total_relatos": total,
        "indice_medio": round(media, 2),
        "pct_superlotado": round(pct, 1),
        "linhas_criticas": criticas,
        "latencia_segundos": 6,
    }
'''

# ============================================================
# app/routers/recomendacoes.py
# ============================================================
ARQUIVOS["app/routers/recomendacoes.py"] = '''from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter()

MOCK = [
    {
        "id": 1,
        "linha": "L1",
        "prioridade": "alta",
        "titulo": "Reforco de frota no pico da tarde",
        "descricao": "Indice medio de 2,9 entre 17h e 19h.",
        "impacto": "Reducao estimada de 30% nos relatos de superlotacao.",
        "acao": "Adicionar 3 veiculos entre 17h e 19h em dias uteis.",
    },
    {
        "id": 2,
        "linha": "L4",
        "prioridade": "alta",
        "titulo": "Criar linha expressa Messejana-Centro",
        "descricao": "Concentracao de embarques em 4 paradas.",
        "impacto": "Alivio de ~20% na linha regular.",
        "acao": "Piloto de 30 dias com expresso saindo as 6h-8h.",
    },
    {
        "id": 3,
        "linha": "L5",
        "prioridade": "media",
        "titulo": "Ajustar grade horaria da manha",
        "descricao": "Intervalo de 18 min entre 6h e 7h coincide com pico.",
        "impacto": "Distribuicao mais uniforme da demanda.",
        "acao": "Reduzir intervalo para 10 min entre 6h e 8h30.",
    },
]


@router.get("/recomendacoes")
async def recomendacoes(linha: Optional[str] = Query(None)):
    if not linha or linha == "Todas":
        return MOCK
    return [r for r in MOCK if r["linha"] == linha]
'''

# ============================================================
# scripts/__init__.py
# ============================================================
ARQUIVOS["scripts/__init__.py"] = ""

# ============================================================
# scripts/init_db.py
# ============================================================
ARQUIVOS["scripts/init_db.py"] = '''"""
Cria as tabelas no Turso (ou SQLite local).
Uso: python -m scripts.init_db
"""
import asyncio
import os
import libsql_client
from dotenv import load_dotenv

load_dotenv()

URL = os.getenv("TURSO_DATABASE_URL", "file:local.db")
TOKEN = os.getenv("TURSO_AUTH_TOKEN", "")

SCHEMA = [
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
        tipo TEXT NOT NULL CHECK (tipo IN ('motorista', 'cobrador', 'gestor', 'passageiro')),
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
        sentido TEXT CHECK (sentido IN ('ida', 'volta')),
        origem TEXT NOT NULL CHECK (origem IN ('motorista', 'passageiro', 'crowdsourcing')),
        criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    )""",
    "CREATE INDEX IF NOT EXISTS idx_relatos_linha_hora ON relatos(linha_id, criado_em)",
    "CREATE INDEX IF NOT EXISTS idx_relatos_criado_em ON relatos(criado_em)",
]


async def main():
    kwargs = {"url": URL}
    if TOKEN:
        kwargs["auth_token"] = TOKEN

    print(f"Conectando em: {URL}")
    async with libsql_client.create_client(**kwargs) as client:
        for stmt in SCHEMA:
            await client.execute(stmt)
            print(f"OK: {stmt.splitlines()[0][:60]}...")
    print("Banco inicializado com sucesso.")


if __name__ == "__main__":
    asyncio.run(main())
'''

# ============================================================
# scripts/seed_db.py
# ============================================================
ARQUIVOS["scripts/seed_db.py"] = '''"""
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
'''


# ============================================================
# Execucao
# ============================================================
def main():
    base = Path.cwd()
    print(f"Diretorio atual: {base}")
    print()

    # Cria pastas
    for pasta in ["app", "app/routers", "scripts"]:
        (base / pasta).mkdir(parents=True, exist_ok=True)
        print(f"[dir] {pasta}")

    print()

    # Cria arquivos
    criados = 0
    erros = 0
    for caminho, conteudo in ARQUIVOS.items():
        try:
            destino = base / caminho
            destino.parent.mkdir(parents=True, exist_ok=True)
            destino.write_text(conteudo, encoding="utf-8")
            print(f"[ok]  {caminho}")
            criados += 1
        except Exception as e:
            print(f"[ERRO] {caminho} -> {e}")
            erros += 1

    print()
    print(f"Concluido: {criados} arquivos criados, {erros} erros.")


if __name__ == "__main__":
    main()