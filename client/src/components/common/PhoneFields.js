"use client";

import { PHONE_COUNTRY_CODES } from "@/lib/phone/countryCodes";
import { normalizePhoneNumber } from "@/lib/phone/parsePhone";

const COUNTRY_CODE_PLACEHOLDER = "Select country code";

const PhoneFields = ({
  countryCode = "",
  phoneNumber = "",
  onCountryCodeChange,
  onPhoneNumberChange,
  disabled = false,
  required = false,
  idPrefix = "phone",
}) => {
  const hasCountryCode = Boolean(countryCode);

  return (
    <div className="phone-fields">
      <div className="phone-fields__code">
        <label
          className="heading-color ff-heading fw600 mb10"
          htmlFor={`${idPrefix}-country-code`}
        >
          Country code
        </label>
        <select
          id={`${idPrefix}-country-code`}
          className={`form-control phone-fields__select${
            !hasCountryCode ? " phone-fields__select--placeholder" : ""
          }`}
          value={countryCode || ""}
          onChange={(event) => onCountryCodeChange(event.target.value)}
          disabled={disabled}
          aria-label="Phone country code"
        >
          <option value="" disabled={required}>
            {COUNTRY_CODE_PLACEHOLDER}
          </option>
          {PHONE_COUNTRY_CODES.map((entry) => (
            <option key={entry.code} value={entry.code}>
              {entry.label}
            </option>
          ))}
        </select>
      </div>

      <div className="phone-fields__number">
        <label
          className="heading-color ff-heading fw600 mb10"
          htmlFor={`${idPrefix}-number`}
        >
          Phone number
        </label>
        <input
          id={`${idPrefix}-number`}
          type="tel"
          className="form-control"
          placeholder="50 123 4567"
          value={phoneNumber}
          onChange={(event) =>
            onPhoneNumberChange(normalizePhoneNumber(event.target.value))
          }
          disabled={disabled}
          required={required}
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={15}
        />
      </div>
    </div>
  );
};

export default PhoneFields;
