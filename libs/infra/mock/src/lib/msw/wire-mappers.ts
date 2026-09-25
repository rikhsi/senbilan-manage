import {
  type Notification,
  type Role,
  type Session,
  type User,
  type PermissionKey,
} from '@senbilan/core/domain';

export const userToWire = (user: User) => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  avatarUrl: user.avatarUrl,
  status: user.status,
  roleIds: [...user.roleIds],
  lastActiveAt: user.lastActiveAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const roleToWire = (role: Role) => ({
  id: role.id,
  name: role.name,
  description: role.description,
  permissions: [...role.permissions],
  isSystem: role.isSystem,
  usersCount: role.usersCount,
  createdAt: role.createdAt,
  updatedAt: role.updatedAt,
});

export const sessionToWire = (session: Session) => ({
  user: userToWire(session.user),
  roleIds: [...session.roleIds],
  permissions: [...session.permissions] as PermissionKey[],
  issuedAt: session.issuedAt,
  expiresAt: session.expiresAt,
});

export const notificationToWire = (notification: Notification) => ({
  id: notification.id,
  kind: notification.kind,
  title: notification.title,
  body: notification.body,
  link: notification.link,
  readAt: notification.readAt,
  createdAt: notification.createdAt,
});
