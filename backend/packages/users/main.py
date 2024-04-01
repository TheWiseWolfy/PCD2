import json
import os
import psycopg2
import psycopg2.extras
import redis
from src.utils.logger import BaseLogger
from src.utils.router import Router
from src.routes.get import GetRoute
from src.routes.create import CreateRoute
from src.routes.login import LoginRoute
from src.services.get import GetService
from src.services.create import CreateService
from src.services.login import LoginService


def lambda_handler(event, context):
    redis_host = os.environ.get("REDIS_HOST")
    redis_port = int(os.environ.get("REDIS_PORT"))
    pg_host = os.environ.get("DATABASE_HOST")
    pg_port = os.environ.get("DATABASE_PORT")
    pg_db = os.environ.get("DATABASE_DATABASE")
    pg_user = os.environ.get("DATABASE_USERNAME")
    pg_password = os.environ.get("DATABASE_PASSWORD")

    redis_client = redis.Redis(host=redis_host, port=redis_port)
    pg_conn = psycopg2.connect(
        host=pg_host, port=pg_port, database=pg_db, user=pg_user, password=pg_password
    )

    logger = BaseLogger()

    get_service = GetService(redis_client=redis_client, postgres_client=pg_conn)
    create_service = CreateService(redis_client=redis_client, postgres_client=pg_conn)
    login_service = LoginService(redis_client=redis_client, postgres_client=pg_conn)

    get_route = GetRoute(service=get_service)
    create_route = CreateRoute(service=create_service)
    login_route = LoginRoute(service=login_service)

    router = Router(logger=logger)
    router.register("users-get", handler=get_route)
    router.register("users-create", handler=create_route)
    router.register("users-login", handler=login_route)

    response = router.call(event)

    return response.to_lambda_response()
