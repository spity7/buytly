export default function FormFieldError({ id, message }) {
  if (!message) return null;
  return (
    <p className="property-form-field-error mb0" id={id} role="alert">
      {message}
    </p>
  );
}
