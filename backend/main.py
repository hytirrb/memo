from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .routers import todos

app = FastAPI(title="Daily Todo API")

BASE_DIR = Path(__file__).resolve().parent.parent
ATTACHMENTS_DIR = BASE_DIR / "attachments"
FRONTEND_DIST_DIR = BASE_DIR / "frontend" / "dist"
ATTACHMENTS_DIR.mkdir(exist_ok=True)

app.mount("/attachments", StaticFiles(directory=str(ATTACHMENTS_DIR)), name="attachments")

assets_dir = FRONTEND_DIST_DIR / "assets"
if assets_dir.exists():
    app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(todos.router)


@app.get("/")
def serve_index():
    index_file = FRONTEND_DIST_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {"error": "frontend dist not found, run npm run build first"}


@app.get("/{full_path:path}")
def serve_frontend(full_path: str):
    if full_path.startswith("todos") or full_path.startswith("attachments"):
        return {"error": "not found"}

    target = FRONTEND_DIST_DIR / full_path
    if target.exists() and target.is_file():
        return FileResponse(target)

    index_file = FRONTEND_DIST_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)

    return {"error": "frontend dist not found, run npm run build first"}
