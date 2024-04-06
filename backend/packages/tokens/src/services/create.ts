
import redis from 'redis'
import pg from 'pg'
import aws from 'aws-sdk'
import { BaseService } from '../utils/service'

type Input = {
    connectionId: string
    projectId: string
    name: string
    description: string
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
    const name = input.name
    const description = input.description

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
        WHERE project_id = $1 AND user_id = $2
    `, [projectId, userId])

    if (projects.rows.length === 0) {
        return {
            reason: 'Not authorized'
        }
    }

    const tokens = await self.postgresClient.query(`
        INSERT INTO tokens (project_id, name, description)
        VALUES ($1, $2, $3)
        RETURNING *
    `, [projectId, name, description])

    const connectionIds = await self.redisClient.SMEMBERS(`users:${userId}`)

    for await (const connectionId of connectionIds) {
        if (connection === input.connectionId) {
            continue
        }

        await self.callbackAPIClient.postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify({
                action: "tokens-create",
                data: {
                    token: tokens.rows[0]
                }
            })
        }).promise()
    }

    return {
        token: tokens.rows[0]
    }
}