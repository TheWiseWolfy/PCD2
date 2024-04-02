export type NotificationType = 'positive' | 'negative' | 'neutral'

export type Notification = {
    id: string
    type: NotificationType
    title: string
    description: string
}

export type NotificationsState = {
    notifications: Notification[]
}

export type NotificationsAddAction = { type: 'notifications-add', notification: Omit<Notification, 'id'> }
export type NotificationsRemoveAction = { type: 'notifications-remove', notification: { id: string } }
export type NotificationsActions = NotificationsAddAction | NotificationsRemoveAction
