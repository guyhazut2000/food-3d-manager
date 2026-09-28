import uuid

from pydantic import BaseModel, Field

from app.auth.models import User


class Credentials(BaseModel):
    username: str = Field(pattern=r"^[A-Za-z0-9_]{3,20}$")
    password: str = Field(min_length=8, max_length=128)


class UserOut(BaseModel):
    id: uuid.UUID
    username: str
    onboarded: bool

    @classmethod
    def from_user(cls, user: User) -> "UserOut":
        return cls(id=user.id, username=user.username, onboarded=user.onboarded_at is not None)
