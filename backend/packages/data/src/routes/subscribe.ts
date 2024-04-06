import { BaseRoute } from '../utils/route'
import { BaseService } from '../utils/service'
import { makeResponse } from '../utils/response'

type Input = {
    connectionId: string
    projectId: string
    visualisationId: string
}

interface SubscribeRoute extends BaseRoute<Input, any> { }

type Self = {
    service: BaseService<Input, any>
}

export const makeSubscribeRoute = (service: BaseService<Input, any>): SubscribeRoute => {
    const self: Self = {
        service
    }

    return {
        call: call(self)
    }
}

const call = (self: Self): SubscribeRoute['call'] => async (request) => {
    const connectionId = request.connectionId
    const projectId = request.data.projectId
    const visualisationId = request.data.visualisationId

    const response = await self.service.call({ connectionId, projectId, visualisationId })

    return makeResponse(
        200,
        request.action,
        request.requestId,
        response
    )
}