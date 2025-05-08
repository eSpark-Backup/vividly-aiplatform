import * as yup from 'yup';

export const createSubscriptionSchema = yup.object({
    body: yup.object({
        sourceId: yup.string().required("Source ID is required"),
        planId: yup
            .string()
            .required("Plan ID is required"),
        customer: yup
            .object({
                firstName: yup.string().required("First name is required").max(100, "First name too long"),
                lastName: yup.string().required("Last name is required").max(100, "Last name too long"),
                email: yup.string().required("Email is required").email("Invalid email format").max(100, "Email too long"),
                phone: yup
                    .string()
                    .matches(/^\+?[\d\s-]+$/, "Invalid phone number format")
                    .max(20, "Phone number too long")
                    .nullable(),
            })
            .required("Customer information is required"),
    }),
})

// Schema for canceling a subscription
export const cancelSubscriptionSchema = yup.object({
    body: yup.object({
        subscriptionId: yup.string().required("Subscription ID is required"),
    }),
})

// Schema for upgrading a subscription
export const upgradeSubscriptionSchema = yup.object({
    body: yup.object({
        subscriptionId: yup.string().required("Subscription ID is required"),
        planId: yup
            .string()
            .required("New plan ID is required")
    }),
})

// Schema for creating a card
export const createCardSchema = yup.object({
    body: yup.object({
        sourceId: yup.string().required("Source ID is required"),
        customer: yup
            .object({
                firstName: yup.string().required("First name is required").max(100, "First name too long"),
                lastName: yup.string().required("Last name is required").max(100, "Last name too long"),
            })
            .required("Customer information is required"),
    }),
})

// Schema for Making a card default
export const defaultCardSchema = yup.object({
    body: yup.object({
        cardId: yup.string().required("Card ID is required"),
    }),
})

