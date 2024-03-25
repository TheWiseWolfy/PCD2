import redis from 'redis'
import pg from 'pg'
import { getRouteKey, getConnectionId, getBody } from './utils'

const env = makeEnv()
const boundMakeClients = makeClients(env)

export async function handler(event) {
    try {
        const clients = await boundMakeClients()

        await handleRoute(env, clients, event)
        
        return {
            statusCode: 200
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
        case 'user-create':
            return create(env, clients, event)
        case 'user-login':
            return login(env, clients, event)
        case 'user-logout':
            return logout(env, clients, event)
    }
}

async function create(env, clients, event) {
    const redisClient = clients.redisClient
    const connectionId = event.requestContext.connectionId
    
    console.log(event)
}

async function login(env, clients, event) {
    const redisClient = clients.redisClient
    const connectionId = getConnectionId(event)
    
    console.log(event)
}


async function logout(env, clients, event) {
    const redisClient = clients.redisClient
    const connectionId = getConnectionId(event)
    
    console.log(event)
}

