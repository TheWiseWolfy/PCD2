import redis from 'redis'
import pg from 'pg'
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
        databaseClient
    })
}

async function handleRoute(env, clients, event) {
    switch (getRouteKey(event)) {
        case 'project-get':
            return get(env, clients, event)
        case 'project-create':
            return create(env, clients, event)
    }
}

async function get(env, clients, event) {
    const redisClient = clients.redisClient
    const databaseClient = clients.databaseClient
    const connectionId = getConnectionId(event)
    const body = getBody(event)
    const data = body.data
    
    const id = data.id
    
    const projects = await databaseClient.query(`
        SELECT *
        FROM projects
        WHERE id = $1
    `, [id])

    return projects?.[0] || null
}

async function create(env, clients, event) {
    const redisClient = clients.redisClient
    const databaseClient = clients.databaseClient
    const connectionId = getConnectionId(event)
    const body = getBody(event)
    const data = body.data
    
    const rawConnection = await redisClient.HGET("connections", connectionId)
    const connection = JSON.parse(rawConnection)
    
    const ownerId = connection.userId
    const name = data.name
    const description = data.description
    
    const project = await databaseClient.query(`
        INSERT INTO projects (owner_id, name, description)
        VALUES ($1, $2, $3)
        RETURNING *
    `, [ownerId, name, description])
    
    return project
}
