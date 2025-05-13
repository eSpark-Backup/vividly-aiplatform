//All Plans Details
export const subscriptionFeatureAccess = {
    FREE: {
        name: "FREE",
        maxPictureGeneration: 20,
        maxPictureAnalysis: 20,
        humanizeSupport: false,
        voiceAssistanceSupport: false,
    },
    [process.env.PLUS_PLAN_MONTHLY_ID]: {
        name: "VIVIDLY PLUS MONTHLY",
        maxPictureGeneration: 100,
        maxPictureAnalysis: 100,
        humanizeSupport: false,
        voiceAssistanceSupport: false,
    },
    [process.env.PLUS_PLAN_ANNUALLY_ID]: {
        name: "VIVIDLY PLUS ANNUAL",
        maxPictureGeneration: 100,
        maxPictureAnalysis: 100,
        humanizeSupport: false,
        voiceAssistanceSupport: false,
    },
    [process.env.PREMIUM_PLAN_MONTHLY_ID]: {
        name: "VIVIDLY PREMIUM MONTHLY",
        maxPictureGeneration: Infinity,
        maxPictureAnalysis: Infinity,
        humanizeSupport: true,
        voiceAssistanceSupport: true,
    },
    [process.env.PREMIUM_PLAN_ANNUALLY_ID]: {
        name: "VIVIDLY PREMIUM ANNUAL",
        maxPictureGeneration: Infinity,
        maxPictureAnalysis: Infinity,
        humanizeSupport: true,
        voiceAssistanceSupport: true,
    },
    [process.env.STUDENT_PLAN_MONTHLY_ID]: {
        name: "VIVIDLY STUDENT MONTHLY",
        maxPictureGeneration: Infinity,
        maxPictureAnalysis: Infinity,
        humanizeSupport: true,
        voiceAssistanceSupport: true,
    },
    [process.env.STUDENT_PLAN_ANNUALLY_ID]: {
        name: "VIVIDLY STUDENT ANNUAL",
        maxPictureGeneration: Infinity,
        maxPictureAnalysis: Infinity,
        humanizeSupport: true,
        voiceAssistanceSupport: true,
    },
};


export const SUBSCRIPTION_STATUS = {
    FREE: "FREE",
    ACTIVE: "ACTIVE",
    CANCELLED: "CANCELLED",
};

