import * as yup from 'yup';

const SUPPORTED_IMAGE_FORMATS = ['image/jpg', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const updateProfileSchema = yup.object({
    body: yup.object({
        first_name: yup.string()
            .max(500, 'Address too long'),
        last_name: yup.string()
            .max(500, 'Address too long'),
        phone: yup.string()
            .matches(/^\+?[\d\s-]+$/, 'Invalid phone number format')
            .max(20, 'Phone number too long'),
        address: yup.string()
            .max(500, 'Address too long'),
        city: yup.string()
            .max(100, 'City name too long'),
        birthdate: yup.string()
            .max(new Date(), 'Birthdate cannot be in the future')
            .nullable(),
    })
});