import httpx
from .config import settings


async def get_isochrone(point: str,
                        profile: str = "car",
                        cost_type: str = "time",
                        cost_value: int = 600,
                        direction: str = "departure") -> dict:
    params = {
        "point": point,
        "resource": "bdtopo-osrm",
        "profile": profile,
        "costType": cost_type,
        "costValue": cost_value,
        "direction": direction,
        "format": "json",  # adapter si besoin (geojson, etc.)
    }

    # Si clé API : params["apiKey"] = settings.ign_api_key
    async with httpx.AsyncClient(timeout=settings.http_timeout) as client:
        response = await client.get(settings.ign_isochrone_url, params=params)
        response.raise_for_status()
        return response.json()
