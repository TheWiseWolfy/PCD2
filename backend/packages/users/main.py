import os
import json
import psycopg2
import psycopg2.extras
import redis
import random
import string
from psycopg2.extensions import connection


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
    body_json = json.loads(body)

    request_id = body_json.get("requestId", "")
    request_data = body_json.get("data", {})
    user_id = request_data.get("id", "")

    user = None

    with pg_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute("SELECT id, email, name FROM users WHERE id = %s", (user_id))
        user = cursor.fetchone()

    return {"action": "users-get", "requestId": request_id, "result": user}


def create(pg_conn: connection, redis: redis.Redis, event):
    request_context = event.get("requestContext", {})
    connection_id = request_context.get("connectionId", "")
    body = event.get("body", "")
    body_json = json.loads(body)

    request_id = body_json.get("requestId", "")
    request_data = body_json.get("data", {})
    email = request_data.get("email", "")
    name = request_data.get("name", "")
    password = request_data.get("password", "")

    user = None

    with pg_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute(
            "INSERT INTO users (email, name, password) VALUES (%s, %s, %s)",
            (email, name, password),
        )
        pg_conn.commit()

        cursor.execute(
            "SELECT id, email, name FROM users WHERE email = %s AND password = %s",
            (email, password),
        )
        user = cursor.fetchone()

    return {"action": "users-create", "requestId": request_id, "data": user}


def login(pg_conn: connection, redis: redis.Redis, event):
    request_context = event.get("requestContext", {})
    connection_id = request_context.get("connectionId", "")
    body = event.get("body", "")
    body_json = json.loads(body)

    request_id = body_json.get("requestId", "")
    request_data = body_json.get("data", {})
    email = request_data.get("email", "")
    password = request_data.get("password", "")
    session = request_data.get("session", "")

    user = None

    existing_session = redis.hget("user:sessions", session)

    if existing_session:
        existing_session = json.loads(existing_session)
        user = existing_session.get("user", {})

        return {
            "action": "users-login",
            "requestId": request_id,
            "data": {"user": user, "tokens": {"auth": session}},
        }

    with pg_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute(
            "SELECT id, email, name FROM users WHERE email = %s AND password = %s",
            (email, password),
        )
        user = cursor.fetchone()

    if not user:
        return {
            "action": "users-login",
            "requestId": request_id,
            "data": {"reason": "Invalid credentials"},
        }

    session = "".join(
        random.SystemRandom().choice(string.ascii_uppercase + string.digits)
        for _ in range(16)
    )

    redis.hset("connections", connection_id, json.dumps({"user": user}))
    redis.sadd(f"users:{user['id']}", connection_id)
    redis.hset("user:sessions", session, json.dumps({"user": user}))

    return {
        "action": "users-login",
        "requestId": request_id,
        "data": {"user": user, "tokens": {"auth": session}},
    }
