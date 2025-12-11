import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Form from '../../components/Form';

describe('Form Component', () => {
  const mockOnSubmit = jest.fn();

  const basicFields = [
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'Enter your email',
      validation: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        patternMessage: 'Please provide a valid email',
      },
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      placeholder: 'Enter your password',
      validation: {
        required: true,
        minLength: 6,
        minLengthMessage: 'Password must be at least 6 characters',
      },
    },
  ];

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  describe('Rendering', () => {
    it('should render form with all fields', () => {
      render(<Form onSubmit={mockOnSubmit} fields={basicFields} />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('should render custom submit button text', () => {
      render(
        <Form onSubmit={mockOnSubmit} fields={basicFields} submitText="Sign In" />
      );

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should render required indicators', () => {
      render(<Form onSubmit={mockOnSubmit} fields={basicFields} />);

      const requiredIndicators = screen.getAllByText('*');
      expect(requiredIndicators).toHaveLength(2);
    });

    it('should render textarea for textarea type', () => {
      const fieldsWithTextarea = [
        {
          name: 'content',
          label: 'Content',
          type: 'textarea',
          validation: { required: true },
        },
      ];

      render(<Form onSubmit={mockOnSubmit} fields={fieldsWithTextarea} />);

      const textarea = screen.getByLabelText(/content/i);
      expect(textarea.tagName).toBe('TEXTAREA');
    });
  });

  describe('User Input', () => {
    it('should update input value on change', async () => {
      render(<Form onSubmit={mockOnSubmit} fields={basicFields} />);

      const emailInput = screen.getByLabelText(/email/i);
      await userEvent.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should handle multiple field inputs', async () => {
      render(<Form onSubmit={mockOnSubmit} fields={basicFields} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');

      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');
    });
  });

  describe('Validation', () => {
    it('should show required field error on blur', async () => {
      render(<Form onSubmit={mockOnSubmit} fields={basicFields} />);

      const emailInput = screen.getByLabelText(/email/i);
      
      fireEvent.focus(emailInput);
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toBeInTheDocument();
      });
    });

    it('should show pattern validation error', async () => {
      render(<Form onSubmit={mockOnSubmit} fields={basicFields} />);

      const emailInput = screen.getByLabelText(/email/i);
      
      await userEvent.type(emailInput, 'invalid-email');
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText(/please provide a valid email/i)).toBeInTheDocument();
      });
    });

    it('should show minimum length error', async () => {
      render(<Form onSubmit={mockOnSubmit} fields={basicFields} />);

      const passwordInput = screen.getByLabelText(/password/i);
      
      await userEvent.type(passwordInput, '12345');
      fireEvent.blur(passwordInput);

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
      });
    });

    it('should clear error when valid input is provided', async () => {
      render(<Form onSubmit={mockOnSubmit} fields={basicFields} />);

      const emailInput = screen.getByLabelText(/email/i);
      
      // Enter invalid email
      await userEvent.type(emailInput, 'invalid');
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toBeInTheDocument();
      });

      // Clear and enter valid email
      await userEvent.clear(emailInput);
      await userEvent.type(emailInput, 'test@example.com');

      await waitFor(() => {
        expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
      });
    });

    it('should validate on change after field is touched', async () => {
      render(<Form onSubmit={mockOnSubmit} fields={basicFields} />);

      const emailInput = screen.getByLabelText(/email/i);
      
      // Touch the field
      fireEvent.focus(emailInput);
      fireEvent.blur(emailInput);

      // Now type invalid email
      await userEvent.type(emailInput, 'invalid');

      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with form values when valid', async () => {
      render(<Form onSubmit={mockOnSubmit} fields={basicFields} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('should not call onSubmit when form has errors', async () => {
      render(<Form onSubmit={mockOnSubmit} fields={basicFields} />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('should show all validation errors on submit', async () => {
      render(<Form onSubmit={mockOnSubmit} fields={basicFields} />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toBeInTheDocument();
        expect(screen.getByTestId('password-error')).toBeInTheDocument();
      });
    });

    it('should disable submit button when there are errors', async () => {
      render(<Form onSubmit={mockOnSubmit} fields={basicFields} />);

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });

      // Enter invalid email and blur to trigger validation
      await userEvent.type(emailInput, 'invalid');
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Custom Validation', () => {
    it('should support custom validation function', async () => {
      const fieldsWithCustom = [
        {
          name: 'username',
          label: 'Username',
          validation: {
            required: true,
            custom: (value) => {
              if (value.includes(' ')) {
                return 'Username cannot contain spaces';
              }
              return '';
            },
          },
        },
      ];

      render(<Form onSubmit={mockOnSubmit} fields={fieldsWithCustom} />);

      const usernameInput = screen.getByLabelText(/username/i);
      
      await userEvent.type(usernameInput, 'user name');
      fireEvent.blur(usernameInput);

      await waitFor(() => {
        expect(screen.getByText(/username cannot contain spaces/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should associate labels with inputs', () => {
      render(<Form onSubmit={mockOnSubmit} fields={basicFields} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toHaveAttribute('id', 'email');
      expect(passwordInput).toHaveAttribute('id', 'password');
    });

    it('should have proper form structure', () => {
      render(<Form onSubmit={mockOnSubmit} fields={basicFields} />);

      const form = screen.getByTestId('form');
      expect(form.tagName).toBe('FORM');
    });
  });
});
