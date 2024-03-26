import redis from 'redis'
import { getRouteKey, getConnectionId, getRequestId, getData } from './utils.mjs'

const env = makeEnv()
const boundMakeClients = makeClients(env)

export async function handler(event) {
    try {
        const clients = await boundMakeClients(env)

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
    }
}

function makeClients(env) {
    const redisClient = redis.createClient({ url: `redis://${env.REDIS_HOST}:${env.REDIS_PORT}` }).connect()

    return async (env) => ({
        redisClient: await redisClient
    })
}

async function handleRoute(env, clients, event) {
    switch (getRouteKey(event)) {
        case '$connect':
            return connect(env, clients, event)
        case '$disconnect':
            return disconnect(env, clients, event)
    }
}

async function connect(env, clients, event) {
    const redisClient = clients.redisClient
    const connectionId = getConnectionId(event)
    const body = getBody(event)
    const requestId = getRequestId(body)
    const data = getData(body)

    await redisClient.HSET('connections', connectionId, JSON.stringify({}))
}


async function disconnect(env, clients, event) {
    const redisClient = clients.redisClient
    const connectionId = getConnectionId(event)
    const body = getBody(event)
    const requestId = getRequestId(body)
    const data = getData(body)

    const rawConnection = await redisClient.HGET('connections', connectionId)
    const connection = JSON.parse(rawConnection)
    const user = connection.user

    if (user) {
        await redisClient.SREM(`users:${user.id}`, connectionId)
    }

    await redisClient.HDEL('connections', connectionId)
}

