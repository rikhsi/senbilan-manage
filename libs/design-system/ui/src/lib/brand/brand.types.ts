export type BrandLockupSize = 'sm' | 'md';

export interface BrandMarkParts {
  readonly lead: string;
  readonly tail: string;
}

/** Heart mark served from each app `public/assets`. */
export const BRAND_LOGO_SRC = '/assets/auth/brand_heart.png';

/** Splits SenBilan into the accent prefix and the rest, keeping the source casing. */
export const brandMarkParts = (label: string): BrandMarkParts => {
  const value = label.trim();
  const match = /^(sen)(.*)$/i.exec(value);
  const lead = match?.[1];
  if (!lead) {
    return { lead: value, tail: '' };
  }
  return { lead: value.slice(0, lead.length), tail: value.slice(lead.length) };
};
