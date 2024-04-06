
import redis from 'redis'
import pg from 'pg'
import { BaseService } from '../utils/service'

type Input = {
    connectionId: string
    tokenId: string
    projectId: string
}

interface LoginService extends BaseService<Input, any> { }

type Self = {
    redisClient: redis.RedisClientType
    postgresClient: pg.Pool
}

export const makeLoginService = (redisClient: redis.RedisClientType, postgresClient: pg.Pool): LoginService => {
    const self: Self = {
        redisClient,
        postgresClient
    }

    return {
        call: call(self)
    }
}

const call = (self: Self): LoginService['call'] => async (input) => {
    const connectionId = input.connectionId
    const tokenId = input.tokenId
    const projectId = input.projectId

    const tokens = await self.postgresClient.query(`
        SELECT *
        FROM tokens t
        WHERE t.token_id = $1 AND t.project_id = $2
    `, [tokenId, projectId])

    if (tokens.rows.length === 0) {
        return {
            reason: 'Not found'
        }
    }

    const projects = await self.postgresClient.query(`
        SELECT *
        FROM projects p
        WHERE p.project_id = $1
    `, [projectId])

    await self.redisClient.HSET('connections', connectionId, JSON.stringify({ project: projects.rows[0] }))
    await self.redisClient.SADD(`projects:${projectId}`, connectionId)

    return {
        project: projects.rows[0]
    }
}
