import { cancelSubscription, createSubscription, getUserCards, getUserSubscriptionInfo, upgradeSubscription } from "@/services/subscription";
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



export {
    useGetUserSubscriptionInfo,
    useCreateSubscription,
    useUpgradeSubscription,
    useCancelSubscription,
    useGetUserCards
}