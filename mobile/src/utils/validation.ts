export const isValidMoroccanPhone = (value: string): boolean => /^(0|\+212)[5-7][0-9]{8}$/.test(value.replace(/\s/g, ''));

export const isValidEmail = (value: string): boolean => /\S+@\S+\.\S+/.test(value);

export const isStrongPassword = (value: string): boolean => value.length >= 6;
