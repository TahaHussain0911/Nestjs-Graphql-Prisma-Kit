import otpGenerator from 'otp-generator';
import slugify from 'slugify';

export function DTOTrim({ value }) {
  if (typeof value === 'string') {
    return value.trim();
  }
  return value;
}

export function DTOBoolean({ value }) {
  if (value === true || value === 'true') {
    return true;
  }
  if (value === false || value === 'false') {
    return false;
  }
  return undefined;
}

export function createSlug(value: string) {
  return slugify(value, {
    lower: true,
    strict: true,
  });
}

export function getFileSizeInMbs(size: number) {
  return Math.round(size / 1024 / 1024);
}

export function generateOrderNumber(): string {
  const prefix = 'ORD';
  const letters = Array.from({ length: 3 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26)),
  ).join('');
  const today = new Date();
  const date = today.toISOString().slice(0, 10).replace(/-/g, '');
  const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `${prefix}-${letters}-${date}-${randomCode}`;
}

export function getTimeDifference(timeInMs: number) {
  const timeDiffInSecs = Math.ceil((timeInMs - Date.now()) / 1000);
  return {
    seconds: timeDiffInSecs % 60,
    minutes: Math.floor(timeDiffInSecs / 60),
  };
}

export function generateOtp() {
  return otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
}
