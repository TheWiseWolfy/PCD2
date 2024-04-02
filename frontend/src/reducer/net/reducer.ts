import React from 'react'
import { NetActions, NetState } from './types'

export const netInitialState: NetState = ({
    connected: undefined
})

export const netReducer: React.Reducer<NetState, NetActions> = (state, action) => {
    switch (action.type) {
        case 'net-connected':
            return {
                connected: true
            }
        case 'net-disconnected':
            return {
                connected: false
            }
        default:
            return state
    }
}




