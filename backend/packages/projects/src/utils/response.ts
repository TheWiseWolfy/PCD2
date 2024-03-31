export type Response<T> = {
    statusCode: number,
    data: {
        action: string
        requestId: string
        data: T
    }
}

export const makeResponse = <T>(statusCode: number, action: string, requestId: string, data: T): Response<T> => {
    return {
        statusCode,
        data: {
            action,
            requestId,
            data
        }
    }
}
