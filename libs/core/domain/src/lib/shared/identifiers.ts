import { type Brand } from './brand';

export type UserId = Brand<string, 'UserId'>;
export type RoleId = Brand<string, 'RoleId'>;
export type NotificationId = Brand<string, 'NotificationId'>;

/**
 * Identifier factories. They exist so infrastructure (mappers, fixtures) can
 * construct branded ids explicitly; application/presentation code should
 * never fabricate ids from arbitrary strings.
 */
export const UserId = (value: string): UserId => value as UserId;
export const RoleId = (value: string): RoleId => value as RoleId;
export const NotificationId = (value: string): NotificationId => value as NotificationId;

/** ISO-8601 timestamp as produced by the API. Kept as string to stay serialisable. */
export type IsoDateTime = Brand<string, 'IsoDateTime'>;
export const IsoDateTime = (value: string): IsoDateTime => value as IsoDateTime;
