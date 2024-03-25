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
    pg_conn = psycopg2.connect(
        host=pg_host,
        port=pg_port,
        database=pg_db,
        user=pg_user,
        password=pg_password
    )

    try:
        # Logic based on route key
        if route_key == 'user-create':
            # Extract data from the event body (assuming JSON format)
            body = event.get('body', '')
            body_json = json.loads(body)
            # Example: Inserting data into PostgreSQL table
            with pg_conn.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO users (email, name, password) VALUES (%s, %s, %s)",
                    (body_json.get('email', ''), body_json.get('name', ''), body_json.get('password', ''))
                )
                pg_conn.commit()

        return {
            'statusCode': 200,
            'body': json.dumps('Data processed successfully')
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error: {str(e)}')
        }
    finally:
        # Close connections
        redis_client.close()
        pg_conn.close()