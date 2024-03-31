import json
import typing as t
from dataclasses import dataclass

T = t.TypeVar("T")


@dataclass
class Response(t.Generic[T]):
    status_code: int
    request_id: int
    action: str
    data: T

    def __repr__(self) -> str:
        return json.dumps(
            {
                "statusCode": self.status_code,
                "data": {
                    "action": self.action,
                    "requestId": self.request_id,
                    "data": self.data,
                },
            }
        )
