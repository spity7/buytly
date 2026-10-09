"use client";

const MAX = 5;

export function formatAverageRating(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "0";
  return n % 1 === 0 ? String(Math.round(n)) : n.toFixed(1);
}

export default function ReviewStarRating({
  value = 0,
  max = MAX,
  size = "md",
  className = "",
}) {
  const rating = Math.max(0, Math.min(max, Math.round(Number(value) || 0)));

  return (
    <span
      className={`property-review-stars property-review-stars--${size} ${className}`.trim()}
      role="img"
      aria-label={`${rating} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, i) => (
        <i
          key={i}
          className={i < rating ? "fas fa-star" : "far fa-star"}
          aria-hidden
        />
      ))}
    </span>
  );
}

export function ReviewStarRatingInput({ value, onChange, disabled = false }) {
  return (
    <div
      className="property-review-stars-input"
      role="radiogroup"
      aria-label="Rating"
    >
      {Array.from({ length: MAX }, (_, i) => {
        const star = i + 1;
        const selected = star <= value;
        return (
          <button
            key={star}
            type="button"
            className={`property-review-stars-input__btn${
              selected ? " property-review-stars-input__btn--active" : ""
            }`}
            onClick={() => onChange(star)}
            disabled={disabled}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            aria-pressed={selected}
          >
            <i className={`fas fa-star`} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
