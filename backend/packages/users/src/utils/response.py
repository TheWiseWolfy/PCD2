import json
import typing as t
from dataclasses import dataclass

T = t.TypeVar("T")


@dataclass
class Response(t.Generic[T]):
    status_code: int
    action: str
    request_id: int
    data: T

    def to_lambda_response(self) -> dict:
        return {
            "statusCode": self.status_code,
            "body": json.dumps({
                "action": self.action,
                "requestId": self.request_id,
                "data": json.dumps(self.data)
            })
        }



    def __repr__(self) -> str:
        return json.dumps(
            {
                "statusCode": self.status_code,
                "data": {
                    "action": self.action,
                    "requestId": self.request_id,
                    "data": json.dumps(self.data)
                }
            }
        )
