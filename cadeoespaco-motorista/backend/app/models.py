from pydantic import BaseModel, Field
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
