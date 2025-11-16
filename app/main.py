from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from .config import settings
from .ign_client import get_isochrone

app = FastAPI(title=settings.app_name)

templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/api/isochrone", response_class=JSONResponse)
async def api_isochrone(payload: dict):
    point = payload["point"]
    profile = payload.get("profile", "car")
    cost_type = payload.get("costType", "time")
    cost_value = int(payload.get("costValue", 600))
    direction = payload.get("direction", "departure")

    data = await get_isochrone(
        point=point,
        profile=profile,
        cost_type=cost_type,
        cost_value=cost_value,
        direction=direction,
    )

    # Si besoin, transformer vers un GeoJSON compatible Leaflet ici
    return JSONResponse(data)
