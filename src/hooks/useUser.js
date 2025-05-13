import { getUserProfile, updateStudentId, updateUserAvatar, updateUserProfile } from "@/services/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


// User Profile | GET 
const useGetUserProfile = () => {
    return useQuery({
        queryKey: ["userProfile"],
        queryFn: getUserProfile,
    });
}


// Update User Profile | PUT
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

// Update User Avatar | PUT
const useUpdateUserAvatar = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ["updateUserAvatar"],
        mutationFn: updateUserAvatar,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["userProfile"] })
        }
    });

}

// Update User Student Id | POST
const useUpdateUserStudentId = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ["updateUserStudentId"],
        mutationFn: updateStudentId,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["userProfile"] })
        }
    });

}

export {
    useGetUserProfile,
    useUpdateUserProfile,
    useUpdateUserAvatar,
    useUpdateUserStudentId,
}
