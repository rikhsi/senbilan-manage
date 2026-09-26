import { type AdminCoupleMember } from '@senbilan/core/application';

/** Visible name. Empty names stay a sentence so the phone can identify the person. */
export const coupleMemberTitle = (member: AdminCoupleMember | null, unnamed: string): string => {
  if (!member) {
    return '—';
  }
  const name = member.name.trim();
  return name.length > 0 ? name : unnamed;
};

export const coupleMemberPhone = (member: AdminCoupleMember | null): string =>
  member?.phone.trim() ?? '';

export const coupleMemberTel = (phone: string): string | null => {
  const value = phone.trim();
  return value.length > 0 ? `tel:${value}` : null;
};

/** Creator then partner, skipping empty slots. */
export const coupleMembers = (couple: {
  readonly creator: AdminCoupleMember | null;
  readonly partner: AdminCoupleMember | null;
}): readonly AdminCoupleMember[] =>
  [couple.creator, couple.partner].filter((member): member is AdminCoupleMember => member !== null);

/** Initials source for avatar when the API has no photo. */
export const coupleMemberAvatarName = (member: AdminCoupleMember, fallback: string): string => {
  const name = member.name.trim();
  if (name.length > 0) {
    return name;
  }
  const phone = member.phone.trim();
  if (phone.length > 0) {
    return phone;
  }
  return fallback;
};
