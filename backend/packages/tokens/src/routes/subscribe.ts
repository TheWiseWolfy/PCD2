import { BaseRoute } from '../utils/route'
import { BaseService } from '../utils/service'
import { makeResponse } from '../utils/response'

type Input = {
    connectionId: string
    tokenId: string
    projectId: string
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
    const tokenId = request.data.tokenId
    const projectId = request.data.projectId

    const response = await self.service.call({ connectionId, tokenId, projectId })

    return makeResponse(
        200,
        request.action,
        request.requestId,
        response
    )
}
