import redis from 'redis'
import pg from 'pg'
import aws from 'aws-sdk'
import { getRouteKey, getConnectionId, getBody } from './utils.mjs'

const env = makeEnv()
const boundMakeClients = makeClients(env)

export async function handler(event) {
    try {
        const clients = await boundMakeClients()

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

    return async () => ({
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
        case 'data-get':
            return get(env, clients, event)
        case 'data-create':
            return create(env, clients, event)
    }
}

async function get(env, clients, event) {
    const redisClient = clients.redisClient
    const databaseClient = clients.databaseClient
    const connectionId = getConnectionId(event)
    const body = getBody(event)
    const data = body.data
    
    const rawConnection = await redisClient.HGET("connections", connectionId)
    const connection = JSON.parse(rawConnection)
    const user = connection.user

    if (!user) {
        return { reason: "Not authenticated" }
    }
    
    const ownerId = user.id
    const projectId = data.projectId

    const project = await databaseClient.query(`
        SELECT *
        FROM projects
        WHERE id = $1 AND owner_id = $2
    `, [projectId, ownerId])

    if (!project.rows?.[0]) {
        return { reason: "Not found" }
    }

    const results = await databaseClient.query(`
        SELECT *
        FROM data
        WHERE project_id = $1
    `, [projectId])

    return { result: results.rows[0] }
}

async function create(env, clients, event) {
    const redisClient = clients.redisClient
    const databaseClient = clients.databaseClient
    const callbackAPIClient = clients.callbackAPIClient
    const connectionId = getConnectionId(event)
    const body = getBody(event)
    const data = body.data
    
    const rawConnection = await redisClient.HGET("connections", connectionId)
    const connection = JSON.parse(rawConnection)
    const user = connection.user

    if (!user) {
        return { reason: "Not authenticated" }
    }
    
    const ownerId = user.id
    const projectId = data.projectId
    const value = data.value

    const project = await databaseClient.query(`
        SELECT *
        FROM projects
        WHERE id = $1 AND owner_id = $2
    `, [projectId, ownerId])

    if (!project.rows?.[0]) {
        return { reason: "Not found" }
    }
    
    const result = await databaseClient.query(`
        INSERT INTO data (project_id, value, timestamp)
        VALUES ($1, $2, $3)
        RETURNING *
    `, [projectId, value, new Date().toISOString()])

    const connections = await redisClient.SMEMBERS(`users:${user.id}`)

    for await (const connection of connections) {
        await callbackAPIClient.postToConnection({
            ConnectionId: connection,
            data: {
                action: "data-created",
                data: result.rows[0]
            }
        })
    }

    return { result: result.rows[0] }
}
