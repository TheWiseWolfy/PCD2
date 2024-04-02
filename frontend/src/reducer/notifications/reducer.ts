import React from 'react'
import { NotificationsActions, NotificationsState } from './types'

export const notificationsInitialState: NotificationsState = ({
    notifications: []
})

export const notificationsReducer: React.Reducer<NotificationsState, NotificationsActions> = (state, action) => {
    switch (action.type) {
        case 'notifications-add':
            return {
                ...state,
                notifications: [...state.notifications, { ...action.notification, id: window.crypto.randomUUID() }]
            }
        case 'notifications-remove': {
            const index = state.notifications.findIndex(item => item.id === action.notification.id)
            return {
                ...state,
                notifications: index === -1 ? state.notifications : [...state.notifications.slice(0, index), ...state.notifications.slice(index + 1)]
            }
        }
        default:
            return state
    }
}




