import {
  DEFAULT_PHONE_COUNTRY_CODE,
  PHONE_COUNTRY_CODES,
} from "./countryCodes";

export function normalizePhoneNumber(value) {
  return String(value ?? "").replace(/\D/g, "");
}

export function buildFullPhone(countryCode, phoneNumber) {
  const number = normalizePhoneNumber(phoneNumber);
  if (!number) {
    return "";
  }
  return `${countryCode || DEFAULT_PHONE_COUNTRY_CODE}${number}`;
}

const SORTED_CODES = [...PHONE_COUNTRY_CODES.map((entry) => entry.code)].sort(
  (a, b) => b.length - a.length,
);

export function parseFullPhone(fullPhone) {
  if (!fullPhone) {
    return {
      phoneCountryCode: "",
      phoneNumber: "",
    };
  }

  const trimmed = String(fullPhone).trim();
  if (!trimmed.startsWith("+")) {
    return {
      phoneCountryCode: "",
      phoneNumber: normalizePhoneNumber(trimmed),
    };
  }

  for (const code of SORTED_CODES) {
    if (trimmed.startsWith(code)) {
      return {
        phoneCountryCode: code,
        phoneNumber: normalizePhoneNumber(trimmed.slice(code.length)),
      };
    }
  }

  return {
    phoneCountryCode: "",
    phoneNumber: normalizePhoneNumber(trimmed.replace(/^\+/, "")),
  };
}

export function parsePhoneFromUser(user) {
  if (!user) {
    return {
      phoneCountryCode: "",
      phoneNumber: "",
    };
  }

  if (user.phoneCountryCode || user.phoneNumber) {
    return {
      phoneCountryCode: user.phoneCountryCode || "",
      phoneNumber: normalizePhoneNumber(user.phoneNumber),
    };
  }

  if (user.phone) {
    return parseFullPhone(user.phone);
  }

  return {
    phoneCountryCode: "",
    phoneNumber: "",
  };
}
