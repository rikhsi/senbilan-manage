/** Uzbekistan mobile: country code is fixed; user types the remaining 9 digits. */
export const UZ_PHONE_PREFIX = '+998 ';
export const UZ_PHONE_MASK = '00 000 00 00';

export interface LoginModel {
  phone: string;
  password: string;
}

export const LOGIN_DEMO_MODEL: LoginModel = {
  phone: '',
  password: '',
};

/** Normalise masked / partial input to E.164 (`+998XXXXXXXXX`). */
export const toE164Phone = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  const withoutCountry = digits.startsWith('998') ? digits.slice(3) : digits;
  const local = withoutCountry.slice(0, 9);
  return `+998${local}`;
};

export const isCompleteUzPhone = (value: string): boolean => toE164Phone(value).length === 13;
