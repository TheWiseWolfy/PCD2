import os
import json
import psycopg2
import redis


def lambda_handler(event, context):
    # Retrieve environment variables
    redis_host = os.environ.get('REDIS_HOST')
    redis_port = int(os.environ.get('REDIS_PORT'))
    pg_host = os.environ.get('DATABASE_HOST')
    pg_port = os.environ.get('DATABASE_PORT')
    pg_db = os.environ.get('DATABASE_DATABASE')
    pg_user = os.environ.get('DATABASE_USERNAME')
    pg_password = os.environ.get('DATABASE_PASSWORD')

    request_context = event.get('requestContext', {})
    route_key = request_context.get('routeKey', '')
    connection_id = request_context.get('connectionId', '')
    redis_client = redis.Redis(host=redis_host, port=redis_port)

    # Extract email and password from the request body
    body = event.get('body', '')
    body_json = json.loads(body)
    email = body_json.get('email', '')
    password = body_json.get('password', '')


    pg_conn = psycopg2.connect(
        host=pg_host,
        port=pg_port,
        database=pg_db,
        user=pg_user,
        password=pg_password
    )

    try:
        # Query the database to check if the user exists and the password is correct
        with pg_conn.cursor() as cursor:
            cursor.execute(
                "SELECT COUNT(*) FROM users WHERE email = %s AND password = %s",
                (email, password)
            )
            count = cursor.fetchone()[0]

        # If count is greater than 0, the user exists and password is correct
        if count > 0:
            return {
                'statusCode': 200,
                'body': json.dumps('User authentication successful')
            }
        else:
            return {
                'statusCode': 401,
                'body': json.dumps('User authentication failed')
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error: {str(e)}')
        }
    finally:
        # Close PostgreSQL connection
        pg_conn.close()