import uuid
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

HexColor = Field(pattern=r"^#[0-9a-fA-F]{6}$")


class Credentials(BaseModel):
    username: str = Field(pattern=r"^[A-Za-z0-9_]{3,20}$")
    password: str = Field(min_length=8, max_length=128)


class UserOut(BaseModel):
    id: uuid.UUID
    username: str
    onboarded: bool


class AvatarIn(BaseModel):
    body_type: Literal["round", "tall", "small"]
    skin_color: str = HexColor
    shirt_color: str = HexColor
    hat: Literal["cap", "beanie", "chef"] | None = None
    cart_style: Literal["classic", "basket", "racer"]
    cart_color: str = HexColor


class AvatarOut(AvatarIn):
    model_config = ConfigDict(from_attributes=True)
