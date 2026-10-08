from fastapi import APIRouter, Query
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
