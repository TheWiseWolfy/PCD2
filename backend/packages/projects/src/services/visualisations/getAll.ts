
import redis from 'redis'
import pg from 'pg'
import { BaseService } from '../../utils/service'

type Input = {
    connectionId: string
    projectId: string
}

interface GetAllVisualisationsService extends BaseService<Input, any> { }

type Self = {
    redisClient: redis.RedisClientType
    postgresClient: pg.Pool
}

export const makeGetAllVisualisationsService = (redisClient: redis.RedisClientType, postgresClient: pg.Pool): GetAllVisualisationsService => {
    const self: Self = {
        redisClient,
        postgresClient
    }

    return {
        call: call(self)
    }
}

const call = (self: Self): GetAllVisualisationsService['call'] => async (input) => {
    const connectionId = input.connectionId
    const projectId = input.projectId

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
        SELECT project_id
        FROM projects p
        WHERE p.project_id = $1 AND p.user_id = $2
    `, [projectId, userId])

    if (!projects.rows[0]) {
        return {
            reason: "Not found"
        }
    }

    const visualisations = await self.postgresClient.query(`
        SELECT *
        FROM visualisations v
        WHERE v.project_id = $1
    `, [projectId])

    return {
        visualisations: visualisations?.rows
    }
}