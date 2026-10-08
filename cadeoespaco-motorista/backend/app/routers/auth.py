from fastapi import APIRouter, HTTPException, status
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
