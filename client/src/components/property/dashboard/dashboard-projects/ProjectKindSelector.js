"use client";

import { PROJECT_KIND_OPTIONS } from "@/lib/properties/projectKindOptions";
import { useId, useRef } from "react";

export default function ProjectKindSelector({
  value,
  onChange,
  disabled = false,
  legend,
  description,
}) {
  const legendId = useId();
  const descriptionId = useId();
  const optionRefs = useRef([]);

  const focusOption = (index) => {
    optionRefs.current[index]?.focus();
  };

  const selectByIndex = (index) => {
    const option = PROJECT_KIND_OPTIONS[index];
    if (!option || disabled) return;
    onChange(option.value);
    focusOption(index);
  };

  const handleKeyDown = (event, index) => {
    if (disabled) return;

    const lastIndex = PROJECT_KIND_OPTIONS.length - 1;
    let nextIndex = null;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        nextIndex = index >= lastIndex ? 0 : index + 1;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        nextIndex = index <= 0 ? lastIndex : index - 1;
        break;
      case "Home":
        event.preventDefault();
        nextIndex = 0;
        break;
      case "End":
        event.preventDefault();
        nextIndex = lastIndex;
        break;
      default:
        return;
    }

    selectByIndex(nextIndex);
  };

  return (
    <fieldset className="project-kind-selector" disabled={disabled}>
      <legend id={legendId} className="project-kind-selector__legend">
        {legend}
      </legend>
      {description ? (
        <p id={descriptionId} className="project-kind-selector__description">
          {description}
        </p>
      ) : null}
      <div
        role="radiogroup"
        aria-labelledby={legendId}
        aria-describedby={description ? descriptionId : undefined}
        className="project-kind-selector__grid"
      >
        {PROJECT_KIND_OPTIONS.map((option, index) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              ref={(node) => {
                optionRefs.current[index] = node;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected || (!value && index === 0) ? 0 : -1}
              disabled={disabled}
              className={`project-kind-selector__option${
                selected ? " project-kind-selector__option--selected" : ""
              }`}
              onClick={() => onChange(option.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              <span className="project-kind-selector__option-head">
                <span
                  className="project-kind-selector__icon-wrap"
                  aria-hidden="true"
                >
                  <span className={option.iconClass} />
                </span>
                <span className="project-kind-selector__label">
                  {option.label}
                </span>
                <span
                  className="project-kind-selector__indicator"
                  aria-hidden="true"
                />
              </span>
              <span className="project-kind-selector__hint">{option.hint}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
