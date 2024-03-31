import json
import random
import string
import hashlib
import redis
import psycopg2.extras
from psycopg2.extensions import connection
from ..utils.service import BaseService


class LoginService(BaseService):
    _redis_client: redis.Redis
    _postgres_client: connection

    def __init__(self, redis_client: redis.Redis, postgres_client: connection) -> None:
        self._redis_client = redis_client
        self._postgres_client = postgres_client

    def call(self, connection_id: str, email: str, password: str, session: str):
        if session:
            existing_session = self._redis_client.hget("user:sessions", session)

            if existing_session:
                existing_session = json.loads(existing_session)
                user = existing_session.get("user", {})

                return {"user": user, "tokens": {"auth": session}}

        user = None
        password_hash = hashlib.sha512(password.encode("utf-8")).hexdigest()

        with self._postgres_client.cursor(
            cursor_factory=psycopg2.extras.RealDictCursor
        ) as cursor:
            cursor.execute(
                "SELECT user_id, email, name FROM users WHERE email = %s AND password = %s",
                (email, password_hash),
            )
            user = cursor.fetchone()

        if not user:
            return {"reason": "Invalid credentials"}

        session = "".join(
            random.SystemRandom().choice(string.ascii_uppercase + string.digits)
            for _ in range(16)
        )

        self._redis_client.hset(
            "connections", connection_id, json.dumps({"user": user})
        )
        self._redis_client.sadd(f"users:{user['user_id']}", connection_id)
        self._redis_client.hset("user:sessions", session, json.dumps({"user": user}))

        return {"user": user, "tokens": {"auth": session}}
