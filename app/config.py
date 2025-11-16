import os
from pydantic import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Geo Isochrone App"
    ign_isochrone_url: str = "https://data.geopf.fr/navigation/isochrone"
    # Si clé API IGN ou token :
    ign_api_key: str | None = None

    # Ajout d’options pour les timeouts, etc.
    http_timeout: float = 20.0

    class Config:
        env_file = ".env"


settings = Settings()
