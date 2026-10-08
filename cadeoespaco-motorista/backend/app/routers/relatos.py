import uuid
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
