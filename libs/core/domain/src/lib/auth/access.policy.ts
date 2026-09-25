import { type PermissionKey } from '../permission/permission';
import { type Session } from './session.entity';

/**
 * Optional resource context for attribute-based decisions (ABAC).
 * RBAC rules ignore it; future rules (ownership, tenancy) will read it.
 */
export interface AccessResource {
  readonly type: string;
  readonly id?: string;
  readonly ownerId?: string;
  readonly attributes?: Readonly<Record<string, string | number | boolean>>;
}

export type PolicyDecision = 'allow' | 'deny' | 'abstain';

export interface PolicyRule {
  readonly name: string;
  evaluate(session: Session, permission: PermissionKey, resource?: AccessResource): PolicyDecision;
}

/** Role-based rule: allow when the flattened session permissions contain the key. */
export const rbacRule: PolicyRule = {
  name: 'rbac',
  evaluate: (session, permission) => (session.permissions.has(permission) ? 'allow' : 'deny'),
};

/**
 * Attribute rule: when resource.ownerId is set, only the owner (or elevated
 * `*:admin` permission) may pass; otherwise abstain for other rules.
 */
export const ownershipRule = (adminPermission: PermissionKey = 'users:write'): PolicyRule => ({
  name: 'ownership',
  evaluate: (session, permission, resource) => {
    if (!resource?.ownerId) {
      return 'abstain';
    }
    if (session.user.id === resource.ownerId) {
      return 'allow';
    }
    if (session.permissions.has(adminPermission) || session.permissions.has(permission)) {
      // Elevated principals with the action permission still go through RBAC;
      // ownership alone does not deny them — abstain so rbacRule decides.
      return 'abstain';
    }
    return 'deny';
  },
});

/**
 * Deny-overrides combining: any explicit `deny` wins, otherwise any `allow`
 * wins, otherwise deny (fail-closed).
 */
export class AccessPolicy {
  constructor(private readonly rules: readonly PolicyRule[] = [rbacRule]) {}

  can(session: Session | null, permission: PermissionKey, resource?: AccessResource): boolean {
    if (!session) {
      return false;
    }
    let allowed = false;
    for (const rule of this.rules) {
      const decision = rule.evaluate(session, permission, resource);
      if (decision === 'deny') {
        return false;
      }
      if (decision === 'allow') {
        allowed = true;
      }
    }
    return allowed;
  }

  canAll(session: Session | null, permissions: readonly PermissionKey[]): boolean {
    return permissions.every((permission) => this.can(session, permission));
  }

  canAny(session: Session | null, permissions: readonly PermissionKey[]): boolean {
    return permissions.some((permission) => this.can(session, permission));
  }
}
