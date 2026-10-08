"""
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
