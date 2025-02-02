import * as yup from 'yup';

export const signupSchema = yup.object({
    body: yup.object({
        first_name: yup
            .string()
            .typeError('First name must be a string') // Enforce string type
            .required('First name is required')
            .min(2, 'First name must be at least 2 characters')
            .max(50, 'First name must not exceed 50 characters')
            .matches(/^[a-zA-Z\s]*$/, 'First name can only contain letters and spaces'),

        last_name: yup
            .string()
            .typeError('Last name must be a string') // Enforce string type
            .required('Last name is required')
            .min(2, 'Last name must be at least 2 characters')
            .max(50, 'Last name must not exceed 50 characters')
            .matches(/^[a-zA-Z\s]*$/, 'Last name can only contain letters and spaces'),

        email: yup
            .string()
            .typeError('Email must be a string') // Enforce string type
            .required('Email is required')
            .email('Invalid email format')
            .max(255, 'Email must not exceed 255 characters'),

        password: yup
            .string()
            .typeError('Password must be a string') // Enforce string type
            .required('Password is required')
            .min(8, 'Password must be at least 8 characters')
            .max(72, 'Password must not exceed 72 characters')
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
            ),
    }),
});

export const loginSchema = yup.object({
    body: yup.object({
        email: yup
            .string()
            .typeError('Email must be a string') // Enforce string type
            .required('Email is required')
            .email('Invalid email format'),

        password: yup
            .string()
            .typeError('Password must be a string') // Enforce string type
            .required('Password is required'),
    }),
});