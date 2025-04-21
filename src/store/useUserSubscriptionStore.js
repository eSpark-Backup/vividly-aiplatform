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
        setUserSubscription: (userSubscription) => set({ ...userSubscription }),
        clearUserSubscription: () => set({ id: null, planName: null, recurring: null, planId: null, status: null, startDate: null, nextBillingDate: null, cancelationDate: null }),
    }
    ),
)