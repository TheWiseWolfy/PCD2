import React from 'react'
import { NotificationsActions, NotificationsAddAction, NotificationsState } from './types'
import { removeHandler } from './service/remove'
import { addHandler } from './service/add'

export const notificationsInitialState: NotificationsState = ({
    notifications: []
})

export const notificationsReducer: React.Reducer<NotificationsState, NotificationsActions> = (state, action) => {
    switch (action.type) {
        case 'notifications-add':
            return addHandler(state, action)
        case 'notifications-remove':
            return removeHandler(state, action)
        default:
            return state
    }
}
