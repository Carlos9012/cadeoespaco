from fastapi import FastAPI
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
