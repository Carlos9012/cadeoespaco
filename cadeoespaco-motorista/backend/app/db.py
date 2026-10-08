
from typing import AsyncGenerator, Any
import httpx

from .config import settings


def _http_url() -> str:
    url = settings.turso_database_url
    if url.startswith("libsql://"):
        return "https://" + url[len("libsql://"):]
    if url.startswith("http://") or url.startswith("https://"):
        return url
    raise RuntimeError(
        "TURSO_DATABASE_URL precisa estar em libsql:// ou https:// para usar a HTTP API."
    )


def _headers() -> dict:
    return {
        "Authorization": f"Bearer {settings.turso_auth_token}",
        "Content-Type": "application/json",
    }


def _to_arg(value: Any) -> dict:
    if value is None:
        return {"type": "null"}
    if isinstance(value, bool):
        return {"type": "integer", "value": str(int(value))}
    if isinstance(value, int):
        return {"type": "integer", "value": str(value)}
    if isinstance(value, float):
        return {"type": "float", "value": value}
    # default: string
    return {"type": "text", "value": str(value)}


async def _execute(sql: str, params: tuple = ()) -> dict:
    url = f"{_http_url()}/v2/pipeline"
    payload = {
        "requests": [
            {
                "type": "execute",
                "stmt": {
                    "sql": sql,
                    "args": [_to_arg(p) for p in params],
                },
            },
            {"type": "close"},
        ]
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(url, headers=_headers(), json=payload)
        resp.raise_for_status()
        data = resp.json()

    first = data["results"][0]
    if first.get("type") != "ok":
        erro = first.get("error", {})
        raise RuntimeError(f"Erro do Turso: {erro.get('message', erro)}")

    return first["response"]["result"]


async def fetch_all(sql: str, params: tuple = ()) -> list[dict]:
    """Executa SELECT e retorna lista de dicts."""
    result = await _execute(sql, params)
    cols = [c["name"] for c in result.get("cols", [])]
    rows = result.get("rows", [])

    saida = []
    for row in rows:
        linha = {}
        for nome, celula in zip(cols, row):
            linha[nome] = celula.get("value") if isinstance(celula, dict) else celula
        saida.append(linha)
    return saida


async def fetch_one(sql: str, params: tuple = ()) -> dict | None:
    rows = await fetch_all(sql, params)
    return rows[0] if rows else None


async def execute(sql: str, params: tuple = ()) -> None:
    await _execute(sql, params)



class _DBCli:

    async def execute(self, sql: str, params: tuple = ()) -> Any:
        result = await _execute(sql, params)
        cols = [c["name"] for c in result.get("cols", [])]
        rows_raw = result.get("rows", [])

        class _Row(dict):
            def keys(self):
                return super().keys()

        rows = []
        for r in rows_raw:
            d = _Row()
            for nome, celula in zip(cols, r):
                d[nome] = celula.get("value") if isinstance(celula, dict) else celula
            rows.append(d)

        class _Result:
            def __init__(self, rows):
                self.rows = rows

        return _Result(rows)


async def get_db() -> AsyncGenerator[_DBCli, None]:
    yield _DBCli()


def row_to_dict(row) -> dict:
    if isinstance(row, dict):
        return dict(row)
    try:
        return dict(zip(row.keys(), row))
    except Exception:
        return dict(row)
