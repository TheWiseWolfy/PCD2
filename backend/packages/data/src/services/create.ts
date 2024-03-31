
import redis from 'redis'
import pg from 'pg'
import aws from 'aws-sdk'
import { BaseService } from '../utils/service'

type Input = {
    connectionId: string
    projectId: string
    visualisationId: string
    value: number
}

interface CreateService extends BaseService<Input, any> { }

type Self = {
    callbackAPIClient: aws.ApiGatewayManagementApi
    redisClient: redis.RedisClientType
    postgresClient: pg.Pool
}

export const makeCreateService = (callbackAPIClient: aws.ApiGatewayManagementApi, redisClient: redis.RedisClientType, postgresClient: pg.Pool): CreateService => {
    const self: Self = {
        callbackAPIClient,
        redisClient,
        postgresClient
    }

    return {
        call: call(self)
    }
}

const call = (self: Self): CreateService['call'] => async (input) => {
    const connectionId = input.connectionId
    const projectId = input.projectId
    const visualisationId = input.visualisationId
    const value = input.value

    const rawConnection = await self.redisClient.HGET("connections", connectionId)
    const connection = rawConnection && JSON.parse(rawConnection)
    const user = connection?.user

    if (!user) {
        return {
            reason: 'Not authenticated'
        }
    }

    const userId = user.user_id

    const projectWithVisualisation = await self.postgresClient.query(`
        SELECT *
        FROM projects p
        INNER JOIN visualisations v ON p.project_id = v.project_id
        WHERE p.project_id = $1 AND p.user_id = $2 AND v.visualisation_id = $3
    `, [projectId, userId, visualisationId])

    if (!projectWithVisualisation.rows?.[0]) {
        return {
            reason: 'Not found'
        }
    }

    const data = await self.postgresClient.query(`
        INSERT INTO data (visualisation_id, value, timestamp)
        VALUES ($1, $2, $3)
        RETURNING *
    `, [visualisationId, String(value), new Date().toISOString()])

    const connectionIds = await self.redisClient.SMEMBERS(`users:${user.id}`)

    for await (const connectionId of connectionIds) {
        await self.callbackAPIClient.postToConnection({
            ConnectionId: connectionId,
            Data: {
                action: "data-created",
                data: data.rows[0]
            }
        }).promise()
    }

    return {
        data: data.rows[0]
    }
}