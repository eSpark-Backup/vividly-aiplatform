import { getUserProfile } from "@/services/user";
import { useMutation, useQuery } from "@tanstack/react-query";

const useGetUserProfile = () => {
    return useQuery({
        queryKey: ["userProfile"],
        queryFn: getUserProfile,
    });
}

export {
    useGetUserProfile
}
