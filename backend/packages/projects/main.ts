import process from 'process'
import * as redis from 'redis'
import pg from 'pg'
import aws from 'aws-sdk'
import { makeGetService } from './src/services/get'
import { makeGetAllService } from './src/services/getAll'
import { makeCreateService } from './src/services/create'
import { makeGetRoute } from './src/routes/get'
import { makeGetAllRoute } from './src/routes/getAll'
import { makeCreateRoute } from './src/routes/create'
import { makeRouter } from './src/utils/router'
import { makeLogger } from './src/utils/logger'

export const handler = async (event: any, _context: any) => {
    const REDIS_HOST = process.env['REDIS_HOST']
    const REDIS_PORT = !!process.env['REDIS_PORT'] ? Number(process.env['REDIS_PORT']) : undefined
    const DATABASE_HOST = process.env['DATABASE_HOST']
    const DATABASE_PORT = !!process.env['DATABASE_PORT'] ? Number(process.env['DATABASE_PORT']) : undefined
    const DATABASE_DATABASE = process.env['DATABASE_DATABASE']
    const DATABASE_USERNAME = process.env['DATABASE_USERNAME']
    const DATABASE_PASSWORD = process.env['DATABASE_PASSWORD']

    const callbackAPIClient = new aws.ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: event.requestContext.domainName + '/' + event.requestContext.stage,
    })
    const redisClient = await redis.createClient({ url: `redis://${REDIS_HOST}:${REDIS_PORT}` }).connect() as any
    const postgresClient = new pg.Pool({
        host: DATABASE_HOST,
        port: DATABASE_PORT,
        database: DATABASE_DATABASE,
        user: DATABASE_USERNAME,
        password: DATABASE_PASSWORD
    })

    const logger = makeLogger()

    const getService = makeGetService(redisClient, postgresClient)
    const getAllService = makeGetAllService(redisClient, postgresClient)
    const createService = makeCreateService(callbackAPIClient, redisClient, postgresClient)

    const getRoute = makeGetRoute(getService)
    const getAllRoute = makeGetAllRoute(getAllService)
    const createRoute = makeCreateRoute(createService)

    const router = makeRouter(logger)
    router.register('projects-get', getRoute)
    router.register('projects-get-all', getAllRoute)
    router.register('projects-create', createRoute)

    const response = await router.call(event)

    return response.toLambdaResponse()
}
