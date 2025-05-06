import { create } from "zustand"

export const useUserSubscriptionStore = create()(
    (set) => ({
        id: null,
        planName: null,
        recurring: null,
        planId: null,
        status: null,
        startDate: null,
        nextBillingDate: null,
        cancelationDate: null,
        cardDetails:{
            id: null,
            last4: null,
            cardBrand: null,
            expMonth: null,
            expYear: null
        },
        setUserSubscription: (userSubscription) => set({ ...userSubscription }),
        clearUserSubscription: () => set({ id: null, planName: null, recurring: null, planId: null, status: null, startDate: null, nextBillingDate: null, cancelationDate: null, cardDetails: { id: null, last4: null, brand: null, expMonth: null, expYear: null } }),
    }
    ),
)