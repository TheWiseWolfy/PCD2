import aws from 'aws-sdk'
import pg from 'pg'
import process from 'process'
import redis from 'redis'
import { makeCreateRoute } from './src/routes/create'
import { makeGetAllRoute } from './src/routes/getAll'
import { makeSubscribeRoute } from './src/routes/subscribe'
import { makeUnsubscribeRoute } from './src/routes/unsubscribe'
import { makeCreateService } from './src/services/create'
import { makeGetAllService } from './src/services/getAll'
import { makeSubscribeService } from './src/services/subscribe'
import { makeUnsubscribeService } from './src/services/unsubscribe'
import { makeLogger } from './src/utils/logger'
import { makeRouter } from './src/utils/router'

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

    const getAllService = makeGetAllService(redisClient, postgresClient)
    const createService = makeCreateService(callbackAPIClient, redisClient, postgresClient)
    const subscribeService = makeSubscribeService(redisClient, postgresClient)
    const unsubscribeService = makeUnsubscribeService(redisClient, postgresClient)

    const getAllRoute = makeGetAllRoute(getAllService)
    const createRoute = makeCreateRoute(createService)
    const subscribeRoute = makeSubscribeRoute(subscribeService)
    const unsubscribeRoute = makeUnsubscribeRoute(unsubscribeService)

    const router = makeRouter(logger)
    router.register('data-get-all', getAllRoute)
    router.register('data-create', createRoute)
    router.register('data-create-subscribe', subscribeRoute)
    router.register('data-create-unsubscribe', unsubscribeRoute)

    const response = await router.call(event)

    return response.toLambdaResponse()
}
