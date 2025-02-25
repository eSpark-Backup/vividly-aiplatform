import { getUserProfile, updateUserProfile } from "@/services/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const useGetUserProfile = () => {
    return useQuery({
        queryKey: ["userProfile"],
        queryFn: getUserProfile,
    });
}

const useUpdateUserProfile = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ["updateUserProfile"],
        mutationFn: updateUserProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["userProfile"] })
        }
    });

}




export {
    useGetUserProfile,
    useUpdateUserProfile,
}
