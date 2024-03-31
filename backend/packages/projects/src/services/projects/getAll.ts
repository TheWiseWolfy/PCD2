
import redis from 'redis'
import pg from 'pg'
import { BaseService } from '../../utils/service'

type Input = {
    connectionId: string
}

interface GetAllProjectsService extends BaseService<Input, any> { }

type Self = {
    redisClient: redis.RedisClientType
    postgresClient: pg.Pool
}

export const makeGetAllProjectsService = (redisClient: redis.RedisClientType, postgresClient: pg.Pool): GetAllProjectsService => {
    const self: Self = {
        redisClient,
        postgresClient
    }

    return {
        call: call(self)
    }
}

const call = (self: Self): GetAllProjectsService['call'] => async (input) => {
    const connectionId = input.connectionId

    const rawConnection = await self.redisClient.HGET("connections", connectionId)
    const connection = rawConnection && JSON.parse(rawConnection)
    const user = connection?.user

    if (!user) {
        return {
            reason: 'Not authenticated'
        }
    }

    const userId = user.user_id

    const projects = await self.postgresClient.query(`
        SELECT *
        FROM projects p
        WHERE p.user_id = $1
    `, [userId])

    return {
        projects: projects?.rows
    }
}