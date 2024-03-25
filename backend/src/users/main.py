import os
import json
import psycopg2
import psycopg2.extras
import redis
from psycopg2.extensions import connection


class AuthError(Exception):
    pass


def lambda_handler(event, context):
    redis_host = os.environ.get("REDIS_HOST")
    redis_port = int(os.environ.get("REDIS_PORT"))
    pg_host = os.environ.get("DATABASE_HOST")
    pg_port = os.environ.get("DATABASE_PORT")
    pg_db = os.environ.get("DATABASE_DATABASE")
    pg_user = os.environ.get("DATABASE_USERNAME")
    pg_password = os.environ.get("DATABASE_PASSWORD")

    request_context = event.get("requestContext", {})
    route_key = request_context.get("routeKey", "")

    redis_client = redis.Redis(host=redis_host, port=redis_port)
    pg_conn = psycopg2.connect(
        host=pg_host, port=pg_port, database=pg_db, user=pg_user, password=pg_password
    )

    try:
        result = None

        match route_key:
            case "users-get":
                result = get(pg_conn, redis_client, event)
            case "users-create":
                result = create(pg_conn, redis_client, event)
            case "users-login":
                result = login(pg_conn, redis_client, event)

        return {"statusCode": 200, "body": json.dumps(result)}
    except AuthError:
        return {
            "statusCode": 200,
            "body": json.dumps({"reason": "Credentials not valid"}),
        }
    except Exception as e:
        return {"statusCode": 500, "body": f"Error: {str(e)}"}
    finally:
        # Close connections
        redis_client.close()
        pg_conn.close()


def get(pg_conn: connection, redis: redis.Redis, event):
    request_context = event.get("requestContext", {})
    connection_id = request_context.get("connectionId", "")
    body = event.get("body", "")
    body_json = json.loads(body)["data"]

    user_id = body_json.get("id", "")

    user = None

    with pg_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id))
        user = cursor.fetchone()

    return user


def create(pg_conn: connection, redis: redis.Redis, event):
    request_context = event.get("requestContext", {})
    connection_id = request_context.get("connectionId", "")
    body = event.get("body", "")
    body_json = json.loads(body)["data"]

    email = body_json.get("email", "")
    name = body_json.get("name", "")
    password = body_json.get("password", "")

    user = None

    with pg_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute(
            "INSERT INTO users (email, name, password) VALUES (%s, %s, %s)",
            (email, name, password),
        )
        pg_conn.commit()

        cursor.execute(
            "SELECT * FROM users WHERE email = %s AND password = %s", (email, password)
        )
        user = cursor.fetchone()

    return user


def login(pg_conn: connection, redis: redis.Redis, event):
    request_context = event.get("requestContext", {})
    connection_id = request_context.get("connectionId", "")
    body = event.get("body", "")
    body_json = json.loads(body)["data"]

    email = body_json.get("email", "")
    password = body_json.get("password", "")

    user = None

    with pg_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute(
            "SELECT * FROM users WHERE email = %s AND password = %s", (email, password)
        )
        user = cursor.fetchone()

    if not user:
        raise AuthError()

    redis.hset("connections", connection_id, json.dumps({"user": user}))
    redis.sadd(f"users:{user['id']}", connection_id)

    return user
