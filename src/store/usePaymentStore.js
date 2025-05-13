import { create } from "zustand"

export const usePaymentStore = create()(
    (set) => ({
        customerInfo: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
        },
        selectedPlan: {
            id: "",
            name: "",
            price: "",
            billingPeriod: "",
        },
        setSelectedPlan: (selectedPlan) => set({ selectedPlan }),
        setCustomerInfo: (customerInfo) => set({ customerInfo }),
        clearPayment: () => set({ customerInfo: { firstName: "", lastName: "", email: "", phone: "" }, selectedPlan: { id: "", name: "", price: "", billingPeriod: "" } }),
    }
    ),
)

