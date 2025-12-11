import React, { useState } from 'react';
import Button from './Button';
import './Form.css';

/**
 * Reusable Form component with validation
 */
const Form = ({ onSubmit, fields, submitText = 'Submit', children }) => {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value, validation) => {
    if (!validation) return '';

    if (validation.required && !value) {
      return validation.requiredMessage || 'This field is required';
    }

    if (validation.minLength && value.length < validation.minLength) {
      return validation.minLengthMessage || `Minimum ${validation.minLength} characters required`;
    }

    if (validation.maxLength && value.length > validation.maxLength) {
      return validation.maxLengthMessage || `Maximum ${validation.maxLength} characters allowed`;
    }

    if (validation.pattern && !validation.pattern.test(value)) {
      return validation.patternMessage || 'Invalid format';
    }

    if (validation.custom) {
      return validation.custom(value);
    }

    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));

    // Validate on change if field has been touched
    if (touched[name]) {
      const field = fields.find((f) => f.name === name);
      const error = validateField(name, value, field?.validation);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Validate on blur
    const field = fields.find((f) => f.name === name);
    const error = validateField(name, value, field?.validation);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    fields.forEach((field) => {
      const error = validateField(field.name, values[field.name] || '', field.validation);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    setErrors(newErrors);
    setTouched(
      fields.reduce((acc, field) => ({ ...acc, [field.name]: true }), {})
    );

    // Submit if no errors
    if (Object.keys(newErrors).length === 0) {
      onSubmit(values);
    }
  };

  const hasErrors = Object.values(errors).some((error) => error);

  return (
    <form onSubmit={handleSubmit} className="form" data-testid="form">
      {fields.map((field) => (
        <div key={field.name} className="form-group">
          <label htmlFor={field.name} className="form-label">
            {field.label}
            {field.validation?.required && <span className="required">*</span>}
          </label>

          {field.type === 'textarea' ? (
            <textarea
              id={field.name}
              name={field.name}
              value={values[field.name] || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={field.placeholder}
              className={`form-input ${errors[field.name] && touched[field.name] ? 'error' : ''}`}
              data-testid={`${field.name}-input`}
              rows={field.rows || 4}
            />
          ) : (
            <input
              id={field.name}
              name={field.name}
              type={field.type || 'text'}
              value={values[field.name] || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={field.placeholder}
              className={`form-input ${errors[field.name] && touched[field.name] ? 'error' : ''}`}
              data-testid={`${field.name}-input`}
            />
          )}

          {errors[field.name] && touched[field.name] && (
            <span className="form-error" data-testid={`${field.name}-error`}>
              {errors[field.name]}
            </span>
          )}
        </div>
      ))}

      {children}

      <Button
        type="submit"
        variant="primary"
        disabled={hasErrors && Object.keys(touched).length > 0}
        data-testid="submit-button"
      >
        {submitText}
      </Button>
    </form>
  );
};

export default Form;
