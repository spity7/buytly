/** E.164 country calling codes supported in profile forms (Lebanon first). */
export const PHONE_COUNTRY_CODES = [
  "+961",
  "+971",
  "+966",
  "+974",
  "+973",
  "+968",
  "+965",
  "+962",
  "+20",
  "+1",
  "+44",
  "+33",
  "+49",
  "+39",
  "+34",
  "+31",
  "+32",
  "+41",
  "+43",
  "+45",
  "+46",
  "+47",
  "+48",
  "+351",
  "+353",
  "+358",
  "+30",
  "+36",
  "+40",
  "+420",
  "+61",
  "+64",
  "+81",
  "+82",
  "+86",
  "+91",
  "+92",
  "+880",
  "+60",
  "+62",
  "+63",
  "+66",
  "+84",
  "+90",
  "+27",
  "+234",
  "+254",
  "+55",
  "+52",
  "+54",
];

export const DEFAULT_PHONE_COUNTRY_CODE = "+961";

export function normalizePhoneNumber(value) {
  return String(value ?? "").replace(/\D/g, "");
}

export function buildFullPhone(countryCode, phoneNumber) {
  const number = normalizePhoneNumber(phoneNumber);
  if (!number) {
    return undefined;
  }
  const code = countryCode || DEFAULT_PHONE_COUNTRY_CODE;
  return `${code}${number}`;
}

export function parseFullPhone(fullPhone) {
  if (!fullPhone) {
    return {
      phoneCountryCode: DEFAULT_PHONE_COUNTRY_CODE,
      phoneNumber: "",
    };
  }

  const trimmed = String(fullPhone).trim();
  if (!trimmed.startsWith("+")) {
    return {
      phoneCountryCode: DEFAULT_PHONE_COUNTRY_CODE,
      phoneNumber: normalizePhoneNumber(trimmed),
    };
  }

  const sortedCodes = [...PHONE_COUNTRY_CODES].sort(
    (a, b) => b.length - a.length,
  );

  for (const code of sortedCodes) {
    if (trimmed.startsWith(code)) {
      return {
        phoneCountryCode: code,
        phoneNumber: normalizePhoneNumber(trimmed.slice(code.length)),
      };
    }
  }

  return {
    phoneCountryCode: DEFAULT_PHONE_COUNTRY_CODE,
    phoneNumber: normalizePhoneNumber(trimmed.replace(/^\+/, "")),
  };
}

export function applyPhoneFields(user, { phoneCountryCode, phoneNumber }) {
  const hasCountryCode = phoneCountryCode !== undefined;
  const hasPhoneNumber = phoneNumber !== undefined;

  if (!hasCountryCode && !hasPhoneNumber) {
    return;
  }

  const number = hasPhoneNumber
    ? normalizePhoneNumber(phoneNumber)
    : normalizePhoneNumber(user.phoneNumber);

  if (hasPhoneNumber && !number) {
    user.phoneCountryCode = undefined;
    user.phoneNumber = undefined;
    user.phone = undefined;
    return;
  }

  const code = hasCountryCode
    ? phoneCountryCode || DEFAULT_PHONE_COUNTRY_CODE
    : user.phoneCountryCode || DEFAULT_PHONE_COUNTRY_CODE;

  user.phoneCountryCode = code;
  user.phoneNumber = number || undefined;
  user.phone = buildFullPhone(code, number);
}
