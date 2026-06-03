import type { RegisterOptions } from "react-hook-form";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const ALNUM_SPACE = /^[a-zA-Z0-9\s]+$/;

export function isEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

export function isIndianPhone(raw: string): boolean {
  return raw.replace(/\D/g, "").length === 10;
}

export function isValidLoginIdentifier(raw: string): boolean {
  const trimmed = raw.trim();
  return isEmail(trimmed) || isIndianPhone(trimmed);
}

export function isStrongPassword(password: string): boolean {
  return getPasswordError(password) === null;
}

export function getNameError(value: string): string | null {
  return value.trim() ? null : "Enter your full name";
}

export function getEmailError(value: string): string | null {
  if (!value.trim()) {
    return "Email address is required";
  }

  if (!isEmail(value)) {
    return "Enter a valid email address";
  }

  return null;
}

export function getPasswordError(password: string): string | null {
  if (!password || password.length < 8) {
    return "Password must be at least 8 characters long";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must include at least one uppercase letter";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must include at least one lowercase letter";
  }

  if (!/\d/.test(password)) {
    return "Password must include at least one number";
  }

  if (!/[\W_]/.test(password)) {
    return "Password must include at least one special character";
  }

  return null;
}

export const getStrongPasswordError = getPasswordError;

export function getConfirmPasswordError(
  confirmValue: string,
  passwordValue: string,
): string | null {
  if (!confirmValue) {
    return "Please confirm your password";
  }

  if (confirmValue !== passwordValue) {
    return "Passwords do not match";
  }

  return null;
}

export function getPhoneError(raw: string): string | null {
  if (!raw.trim()) {
    return "Phone number is required";
  }

  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 10) {
    return "Enter a valid 10-digit phone number";
  }

  return null;
}

export function getIdentifierError(raw: string): string | null {
  const trimmed = raw.trim();

  if (!trimmed) {
    return "Email or phone is required";
  }

  if (isValidLoginIdentifier(trimmed)) {
    return null;
  }

  return "Enter a valid email or 10-digit phone number";
}

export function getOtpError(value: string, length = 6): string | null {
  const trimmed = value.trim();

  return new RegExp(`^\\d{${length}}$`).test(trimmed)
    ? null
    : `Enter the ${length}-digit code from your email`;
}

type FieldRules = Record<string, RegisterOptions>;

export const RULES = {
  name: {
    required: "Enter your full name",
    validate: (value: string) => getNameError(value) ?? true,
  },
  optionalName: {
    validate: (value?: string) =>
      value?.trim() ? (getNameError(value) ?? true) : true,
  },
  email: {
    required: "Email address is required",
    validate: (value: string) => getEmailError(value) ?? true,
  },
  phone: {
    required: "Phone number is required",
    validate: (value: string) => getPhoneError(value) ?? true,
  },
  passwordStrong: {
    required: "Password is required",
    validate: (value: string) => getPasswordError(value) ?? true,
  },
  passwordLogin: {
    required: "Password is required",
    minLength: {
      value: 8,
      message: "Password must be at least 8 characters long",
    },
  },
  identifier: {
    required: "Email or phone is required",
    validate: (value: string) => getIdentifierError(value) ?? true,
  },
  confirmPassword: (passwordValue: string) => ({
    required: "Please confirm your password",
    validate: (value: string) =>
      getConfirmPasswordError(value, passwordValue) ?? true,
  }),
  otp: (length = 6) => ({
    required: `Enter the ${length}-digit code`,
    validate: (value: string) => getOtpError(value, length) ?? true,
  }),
} as const;

export function toIndianPhone(raw: string): string {
  return `+91${raw.replace(/\D/g, "")}`;
}

export function buildLoginPayload(
  identifier: string,
  password: string,
): { email?: string; phone_number?: string; password: string } {
  const trimmed = identifier.trim();

  if (isEmail(trimmed)) {
    return { email: trimmed, password };
  }

  return { phone_number: toIndianPhone(trimmed), password };
}

export function fromIndianPhone(e164: string | null | undefined): string {
  if (!e164) {
    return "";
  }

  return e164.startsWith("+91") ? e164.slice(3) : e164.replace(/\D/g, "");
}

export function normalizePinCode(raw: string) {
  return raw.replace(/\D/g, "").slice(0, 6);
}

export const societyRules = {
  name: {
    required: "Enter your society name",
    minLength: { value: 2, message: "Use at least 2 characters" },
    maxLength: { value: 100, message: "At most 100 characters" },
    validate: (value: string) =>
      ALNUM_SPACE.test(value.trim()) || "Only letters, numbers, and spaces",
  },
  address: {
    required: "Enter the full street address",
    minLength: { value: 5, message: "Use at least 5 characters" },
    maxLength: { value: 255, message: "At most 255 characters" },
  },
  city: {
    required: "Enter city",
    minLength: { value: 2, message: "Use at least 2 characters" },
    maxLength: { value: 100, message: "At most 100 characters" },
    validate: (value: string) =>
      ALNUM_SPACE.test(value.trim()) || "Only letters, numbers, and spaces",
  },
  state: {
    required: "Enter state",
    minLength: { value: 2, message: "Use at least 2 characters" },
    maxLength: { value: 100, message: "At most 100 characters" },
    validate: (value: string) =>
      ALNUM_SPACE.test(value.trim()) || "Only letters, numbers, and spaces",
  },
  pin_code: {
    required: "Enter the 6-digit PIN code",
    validate: (value: string) =>
      normalizePinCode(value).length === 6 || "PIN must be exactly 6 digits",
  },
} as const satisfies FieldRules;

export const flatRules = {
  flat_number: {
    required: "Flat number is required.",
    minLength: {
      value: 2,
      message: "Flat number must be at least 2 characters.",
    },
    maxLength: {
      value: 20,
      message: "Flat number cannot exceed 20 characters.",
    },
  },
  floor: {
    required: "Floor is required.",
    validate: (value: string) => {
      const floor = Number(value);

      if (!Number.isInteger(floor)) {
        return "Floor must be a valid number.";
      }

      if (floor < 0) {
        return "Floor cannot be negative.";
      }

      if (floor > 200) {
        return "Floor seems too high.";
      }

      return true;
    },
  },
  block: {
    required: "Block is required.",
    minLength: {
      value: 1,
      message: "Block is required.",
    },
    maxLength: {
      value: 20,
      message: "Block cannot exceed 20 characters.",
    },
  },
} as const satisfies FieldRules;
