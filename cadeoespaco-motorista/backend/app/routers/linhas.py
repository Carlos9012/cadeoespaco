from fastapi import APIRouter, Depends, Query
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
