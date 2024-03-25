import redis from 'redis'

const env = makeEnv()
const boundMakeClients = makeClients(env)

export const handler = async (event) => {
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

const makeEnv = () => {
    return {
        REDIS_HOST: process.env.REDIS_HOST,
        REDIS_PORT: process.env.REDIS_PORT,
    }
}

const makeClients = (env) => {
    const redisClient = redis.createClient({ url: `redis://${env.REDIS_HOST}:${env.REDIS_PORT}` }).connect()

    return async () => ({
        redisClient: await redisClient
    })
}

const handleRoute = async (env, clients, event) => {

}

