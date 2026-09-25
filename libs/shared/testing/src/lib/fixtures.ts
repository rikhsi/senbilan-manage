/**
 * Named fixture aliases for domain entities used in UI / integration specs.
 * Prefer these over ad-hoc object literals.
 */
export { buildPage, buildRole, buildSession, buildUser } from './builders';

import { buildRole, buildSession, buildUser } from './builders';

/** Default fake user fixture. */
export const fakeUser = buildUser;

/** Default fake session fixture. */
export const fakeSession = buildSession;

/** Default fake role fixture. */
export const fakeRole = buildRole;
