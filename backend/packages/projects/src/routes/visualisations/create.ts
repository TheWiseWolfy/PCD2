import { BaseRoute } from '../../utils/route'
import { BaseService } from '../../utils/service'
import { makeResponse } from '../../utils/response'

type Input = {
    connectionId: string
    projectId: string
    name: string
    description: string
}

interface CreateVisualisationsRoute extends BaseRoute<Input, any> { }

type Self = {
    service: BaseService<Input, any>
}

export const makeCreateVisualisationsRoute = (service: BaseService<Input, any>): CreateVisualisationsRoute => {
    const self: Self = {
        service
    }

    return {
        call: call(self)
    }
}

const call = (self: Self): CreateVisualisationsRoute['call'] => async (request) => {
    const connectionId = request.connectionId
    const projectId = request.data.projectId
    const name = request.data.name
    const description = request.data.description

    const response = await self.service.call({ connectionId, projectId, name, description })

    return makeResponse(
        200,
        request.action,
        request.requestId,
        response
    )
}
