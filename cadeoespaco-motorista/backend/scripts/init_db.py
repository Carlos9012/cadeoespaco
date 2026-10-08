"""
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
