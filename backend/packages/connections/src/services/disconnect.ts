
import redis from 'redis'
import { BaseService } from '../utils/service'

type Input = {
    connectionId: string
}

interface DisconnectService extends BaseService<Input, any> { }

type Self = {
    redisClient: redis.RedisClientType
}

export const makeDisconnectService = (redisClient: redis.RedisClientType): DisconnectService => {
    const self: Self = {
        redisClient,
    }

    return {
        call: call(self)
    }
}

const call = (self: Self): DisconnectService['call'] => async (input) => {
    const connectionId = input.connectionId

    const rawConnection = await self.redisClient.HGET("connections", connectionId)
    const connection = rawConnection && JSON.parse(rawConnection)
    const user = connection?.user

    if (user) {
        await self.redisClient.SREM(`users:${user.user_id}`, connectionId)
    }

    await self.redisClient.HDEL('connections', connectionId)
}