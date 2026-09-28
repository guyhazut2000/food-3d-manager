import os

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+asyncpg://food3d:food3d@localhost:5432/food3d"
)

SESSION_COOKIE_NAME = "session"
SESSION_TTL_DAYS = int(os.getenv("SESSION_TTL_DAYS", "7"))
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"
