import { addUserCard, cancelSubscription, createSubscription, getUserCards, getUserSubscriptionInfo, makeCardDefault, upgradeSubscription } from "@/services/subscription";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


// User Subscription Info | GET
const useGetUserSubscriptionInfo = (options) => {
    return useQuery({
        queryKey: ["getUserSubscriptionInfo"],
        queryFn: getUserSubscriptionInfo,
        ...options
    });
}

// Create Subscription | POST
const useCreateSubscription = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ["createSubscription"],
        mutationFn: createSubscription,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getUserSubscriptionInfo"] })
        }
    });
}

// Upgrade Subscription | POST
const useUpgradeSubscription = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ["upgradeSubscription"],
        mutationFn: upgradeSubscription,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getUserSubscriptionInfo"] })
        }
    });
}


// Cancel Subscription | POST
const useCancelSubscription = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ["cancelSubscription"],
        mutationFn: cancelSubscription,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getUserSubscriptionInfo"] })
        }
    });
}

// Get User Cards | GET
const useGetUserCards = () => {
    return useQuery({
        queryKey: ["getUserCards"],
        queryFn: getUserCards,
    });
}

// Add User Card | POST
const useAddUserCard = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ["addUserCard"],
        mutationFn: addUserCard,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getUserCards"] })
        }
    });
}

// Make Card Default | POST
const useMakeCardDefault = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ["makeCardDefault"],
        mutationFn: makeCardDefault,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getUserCards"] })
        },
        onError: (error) => {
            queryClient.invalidateQueries({ queryKey: ["getUserCards"] })
        }
    });
}
export {
    useGetUserSubscriptionInfo,
    useCreateSubscription,
    useUpgradeSubscription,
    useCancelSubscription,
    useGetUserCards,
    useAddUserCard,
    useMakeCardDefault
}