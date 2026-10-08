from fastapi import APIRouter, Depends, Query
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
