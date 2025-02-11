import * as yup from 'yup';

export const signupSchema = yup.object({
    body: yup.object({
        first_name: yup
            .string()
            .typeError('First name must be a string')
            .required('First name is required')
            .min(2, 'First name must be at least 2 characters')
            .max(50, 'First name must not exceed 50 characters')
            .matches(/^[a-zA-Z\s]*$/, 'First name can only contain letters and spaces'),

        last_name: yup
            .string()
            .typeError('Last name must be a string')
            .required('Last name is required')
            .min(2, 'Last name must be at least 2 characters')
            .max(50, 'Last name must not exceed 50 characters')
            .matches(/^[a-zA-Z\s]*$/, 'Last name can only contain letters and spaces'),

        email: yup
            .string()
            .typeError('Email must be a string')
            .required('Email is required')
            .email('Invalid email format')
            .max(255, 'Email must not exceed 255 characters')
    })
});

export const requestPasswordResetSchema = yup.object({
    body: yup.object({
        email: yup
            .string()
            .required('Email is required')
            .email('Invalid email format')
    })
});

export const resetPasswordSchema = yup.object({
    body: yup.object({
        token: yup
            .string()
            .required('Reset token is required'),

        password: yup
            .string()
            .required('Password is required')
            .min(8, 'Password must be at least 8 characters')
            .max(72, 'Password must not exceed 72 characters')
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
            )
    })
});

export const resendVerificationSchema = yup.object({
    body: yup.object({
        email: yup
            .string()
            .required('Email is required')
            .email('Invalid email format')
    })
});

export const verifyAccountSchema = yup.object({
    body: yup.object({
        token: yup
            .string()
            .required('Verification token is required'),

        password: yup
            .string()
            .required('Password is required')
            .min(8, 'Password must be at least 8 characters')
            .max(72, 'Password must not exceed 72 characters')
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
            )
    })
});

export const loginSchema = yup.object({
    body: yup.object({
        email: yup
            .string()
            .typeError('Email must be a string')
            .required('Email is required')
            .email('Invalid email format'),

        password: yup
            .string()
            .typeError('Password must be a string')
            .required('Password is required'),
    }),
});

export const refreshTokenSchema = yup.object({
    body: yup.object({
        refreshToken: yup
            .string()
            .typeError('Email must be a string')
            .required('Refresh token is required')
            .min(40, 'Invalid refresh token')
            .max(255, 'Invalid refresh token'),
    }),
});

export const googleAuthSchema = yup.object({
    body: yup.object({
        email: yup
            .string()
            .typeError('Email must be a string')
            .required('Email is required')
            .email('Invalid email format'),
        first_name: yup
            .string()
            .typeError('Firstname must be a string')
            .required('First name is required')
            .min(2, 'First name must be at least 2 characters'),
        last_name: yup
            .string()
            .typeError('Lastname must be a string')
            .required('Last name is required')
            .min(2, 'Last name must be at least 2 characters'),
        google_id: yup
            .string()
            .typeError('Google ID must be a string')
            .required('Google ID is required')
    })
});