export const UZ_PHONE_PREFIX = '+998 ';
export const UZ_PHONE_MASK = '00 000 00 00';

export const toE164Phone = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  const withoutCountry = digits.startsWith('998') ? digits.slice(3) : digits;
  return `+998${withoutCountry.slice(0, 9)}`;
};

export const isCompleteUzPhone = (value: string): boolean => toE164Phone(value).length === 13;
