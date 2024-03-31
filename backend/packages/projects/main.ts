import process from 'process'
import * as redis from 'redis'
import pg from 'pg'
import aws from 'aws-sdk'
import { makeGetProjectsService } from './src/services/projects/get'
import { makeGetAllProjectsService } from './src/services/projects/getAll'
import { makeCreateProjectsService } from './src/services/projects/create'
import { makeGetVisualisationsService } from './src/services/visualisations/get'
import { makeGetAllVisualisationsService } from './src/services/visualisations/getAll'
import { makeCreateVisualisationsService } from './src/services/visualisations/create'
import { makeGetProjectsRoute } from './src/routes/projects/get'
import { makeGetAllProjectsRoute } from './src/routes/projects/getAll'
import { makeCreateProjectsRoute } from './src/routes/projects/create'
import { makeGetVisualisationsRoute } from './src/routes/visualisations/get'
import { makeGetAllVisualisationsRoute } from './src/routes/visualisations/getAll'
import { makeCreateVisualisationsRoute } from './src/routes/visualisations/create'
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

    const getProjectsService = makeGetProjectsService(redisClient, postgresClient)
    const getAllProjectsService = makeGetAllProjectsService(redisClient, postgresClient)
    const createProjectsService = makeCreateProjectsService(callbackAPIClient, redisClient, postgresClient)
    const getVisualisationsService = makeGetVisualisationsService(redisClient, postgresClient)
    const getAllVisualisationsService = makeGetAllVisualisationsService(redisClient, postgresClient)
    const createVisualisationsService = makeCreateVisualisationsService(callbackAPIClient, redisClient, postgresClient)

    const getProjectsRoute = makeGetProjectsRoute(getProjectsService)
    const getAllProjectsRoute = makeGetAllProjectsRoute(getAllProjectsService)
    const createProjectsRoute = makeCreateProjectsRoute(createProjectsService)
    const getVisualisationsRoute = makeGetVisualisationsRoute(getVisualisationsService)
    const getAllVisualisationsRoute = makeGetAllVisualisationsRoute(getAllVisualisationsService)
    const createVisualisationsRoute = makeCreateVisualisationsRoute(createVisualisationsService)

    const router = makeRouter(logger)
    router.register('projects-get', getProjectsRoute)
    router.register('projects-get-all', getAllProjectsRoute)
    router.register('projects-create', createProjectsRoute)
    router.register('visualisations-get', getVisualisationsRoute)
    router.register('visualisations-get-all', getAllVisualisationsRoute)
    router.register('visualisations-create', createVisualisationsRoute)

    const response = await router.call(event)

    return response
}
