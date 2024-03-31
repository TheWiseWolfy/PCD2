import redis from 'redis'
import pg from 'pg'
import aws from 'aws-sdk'
import { getRouteKey, getConnectionId, getBody, getData, getRequestId } from './utils.mjs'

const env = makeEnv()
const boundMakeClients = makeClients(env)

export async function handler(event) {
    try {
        const clients = await boundMakeClients(event)

        const result = await handleRoute(env, clients, event)
        
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        }
    } catch (error) {
        console.error(error)
        return {
            statusCode: 500
        }
    }
}

function makeEnv() {
    return {
        REDIS_HOST: process.env.REDIS_HOST,
        REDIS_PORT: process.env.REDIS_PORT,
        DATABASE_HOST: process.env.DATABASE_HOST,
        DATABASE_PORT: process.env.DATABASE_PORT,
        DATABASE_DATABASE: process.env.DATABASE_DATABASE,
        DATABASE_USERNAME: process.env.DATABASE_USERNAME,
        DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
    }
}

function makeClients(env) {
    const redisClient = redis.createClient({ url: `redis://${env.REDIS_HOST}:${env.REDIS_PORT}` }).connect()
    const databaseClient = new pg.Pool({
        host: env.DATABASE_HOST,
        port: env.DATABASE_PORT,
        database: env.DATABASE_DATABASE,
        user: env.DATABASE_USERNAME,
        password: env.DATABASE_PASSWORD
    })

    return async (event) => ({
        redisClient: await redisClient,
        databaseClient,
        callbackAPIClient: new aws.ApiGatewayManagementApi({
            apiVersion: '2018-11-29',
            endpoint: event.requestContext.domainName + '/' + event.requestContext.stage,
        })
    })
}

async function handleRoute(env, clients, event) {
    switch (getRouteKey(event)) {
        case 'projects-get-all':
            return getAll(env, clients, event)
        case 'projects-get':
            return get(env, clients, event)
        case 'projects-create':
            return create(env, clients, event)
    }
}

async function getAll(env, clients, event) {
    const redisClient = clients.redisClient
    const databaseClient = clients.databaseClient
    const callbackAPIClient = clients.callbackAPIClient
    const connectionId = getConnectionId(event)
    const body = getBody(event)
    const requestId = getRequestId(body)
    const data = getData(body)
    
    const rawConnection = await redisClient.HGET("connections", connectionId)
    const connection = JSON.parse(rawConnection)
    const user = connection.user

    if (!user) {
        return {
            action: 'projects-get-all',
            requestId,
            data: {
                reason: "Not authenticated"
            }
        }
    }
    
    const ownerId = user.id
    
    const projects = await databaseClient.query(`
        SELECT *
        FROM projects
        WHERE owner_id = $1
    `, [ownerId])

    return {
        action: 'projects-get-all',
        requestId,
        data: {
            projects: projects.rows
        }
    }
}


async function get(env, clients, event) {
    const redisClient = clients.redisClient
    const databaseClient = clients.databaseClient
    const callbackAPIClient = clients.callbackAPIClient
    const connectionId = getConnectionId(event)
    const body = getBody(event)
    const requestId = getRequestId(body)
    const data = getData(body)
    
    const rawConnection = await redisClient.HGET("connections", connectionId)
    const connection = JSON.parse(rawConnection)
    const user = connection.user

    if (!user) {
        return {
            action: 'projects-get',
            requestId,
            data: {
                reason: "Not authenticated"
            }
        }
    }
    
    const id = data.id
    const ownerId = user.id
    
    const projects = await databaseClient.query(`
        SELECT *
        FROM projects
        WHERE id = $1 AND owner_id = $2
    `, [id, ownerId])

    return {
        action: 'projects-get',
        requestId,
        data: {
            project: projects.rows?.[0] || null
        }
    }
}

async function create(env, clients, event) {
    const redisClient = clients.redisClient
    const databaseClient = clients.databaseClient
    const callbackAPIClient = clients.callbackAPIClient
    const connectionId = getConnectionId(event)
    const body = getBody(event)
    const requestId = getRequestId(body)
    const data = getData(body)
    
    const rawConnection = await redisClient.HGET("connections", connectionId)
    const connection = JSON.parse(rawConnection)
    const user = connection.user

    if (!user) {
        return {
            action: 'projects-create',
            requestId,
            data: {
                reason: "Not authenticated"
            }
        }
    }
    
    const ownerId = user.id
    const name = data.name
    const description = data.description
    
    const project = await databaseClient.query(`
        INSERT INTO projects (owner_id, name, description)
        VALUES ($1, $2, $3)
        RETURNING *
    `, [ownerId, name, description])

    const connectionIds = await redisClient.SMEMBERS(`users:${user.id}`)
    
    for await (const connectionId of connectionIds) {
        await callbackAPIClient.postToConnection({
            ConnectionId: connectionId,
            data: {
                action: "projects-create",
                data: project.rows[0]
            }
        })
    }
    
    return {
        action: 'projects-create',
        requestId,
        result: {
            project: project.rows[0]
        }
    }
}
