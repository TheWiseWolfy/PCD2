
import redis from 'redis'
import pg from 'pg'
import { BaseService } from '../utils/service'

type Input = {
    connectionId: string
    projectId: string
    tokenId: string
}

interface GetService extends BaseService<Input, any> { }

type Self = {
    redisClient: redis.RedisClientType
    postgresClient: pg.Pool
}

export const makeGetService = (redisClient: redis.RedisClientType, postgresClient: pg.Pool): GetService => {
    const self: Self = {
        redisClient,
        postgresClient
    }

    return {
        call: call(self)
    }
}

const call = (self: Self): GetService['call'] => async (input) => {
    const connectionId = input.connectionId
    const projectId = input.projectId
    const tokenId = input.tokenId

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
        WHERE p.project_id = $1 AND p.user_id = $2
    `, [projectId, userId])

    if (projects.rows.length === 0) {
        return {
            reason: 'Not authorized'
        }
    }

    const tokens = await self.postgresClient.query(`
        SELECT *
        FROM tokens t
        WHERE t.token_id = $1 AND t.project_id = $2
    `, [tokenId, projectId])

    return {
        token: tokens?.rows?.[0] || null
    }
}