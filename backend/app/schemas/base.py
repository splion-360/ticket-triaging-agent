from datetime import datetime

from pydantic import BaseModel, ConfigDict


class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

class BaseCreateSchema(BaseSchema):
    pass

class BaseResponseSchema(BaseSchema):
    id: str
    created_at: datetime

class PaginationSchema(BaseSchema):
    offset: int = 0
    limit: int = 100

class ErrorResponseSchema(BaseSchema):
    detail: str
    status_code: int
