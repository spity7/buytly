"use client";

const STEPS = [
  { id: 1, label: "Project type" },
  { id: 2, label: "Details" },
];

export default function ProjectWizardSteps({ currentStep }) {
  return (
    <nav
      className="project-wizard-steps"
      aria-label="Project creation progress"
    >
      <ol className="project-wizard-steps__list">
        {STEPS.map((step, index) => {
          const isComplete = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          return (
            <li
              key={step.id}
              className={`project-wizard-steps__item${
                isCurrent ? " project-wizard-steps__item--current" : ""
              }${isComplete ? " project-wizard-steps__item--complete" : ""}`}
              aria-current={isCurrent ? "step" : undefined}
            >
              <span className="project-wizard-steps__marker" aria-hidden="true">
                {isComplete ? (
                  <i className="fal fa-check" aria-hidden="true" />
                ) : (
                  step.id
                )}
              </span>
              <span className="project-wizard-steps__label">{step.label}</span>
              {index < STEPS.length - 1 ? (
                <span
                  className="project-wizard-steps__connector"
                  aria-hidden="true"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
      <p className="project-wizard-steps__meta mb0">
        Step {currentStep} of {STEPS.length}
      </p>
    </nav>
  );
}
