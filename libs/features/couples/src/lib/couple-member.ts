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
