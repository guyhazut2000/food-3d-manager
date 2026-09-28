from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field

HexColor = Annotated[str, Field(pattern=r"^#[0-9a-fA-F]{6}$")]


class AvatarIn(BaseModel):
    body_type: Literal["round", "tall", "small"]
    skin_color: HexColor
    shirt_color: HexColor
    hat: Literal["cap", "beanie", "chef"] | None = None
    cart_style: Literal["classic", "basket", "racer"]
    cart_color: HexColor


class AvatarOut(AvatarIn):
    model_config = ConfigDict(from_attributes=True)
