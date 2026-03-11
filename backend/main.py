from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .routers import todos

app = FastAPI(title="Daily Todo API")

BASE_DIR = Path(__file__).resolve().parent.parent
ATTACHMENTS_DIR = BASE_DIR / "attachments"
ATTACHMENTS_DIR.mkdir(exist_ok=True)

app.mount("/attachments", StaticFiles(directory=str(ATTACHMENTS_DIR)), name="attachments")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(todos.router)
