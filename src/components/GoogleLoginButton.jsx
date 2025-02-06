import { useGoogleLogin } from "@react-oauth/google";
import { useGetGoogleProfile } from "@/hooks/useAuth";
import { googleIcon } from "@/assets"
import { Button } from "./ui/button"
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

const GoogleLoginButton = () => {

    const { mutate, isSuccess, isError, data } = useGetGoogleProfile();
    const { toast } = useToast();


    const showToast = (title, description, type) => {
        toast({ title, description, type });
    };

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            mutate(tokenResponse);
        },
        onError: () => showToast("Error", "Failed to login with Google", "error"),
        flow: "implicit",
    });

    useEffect(() => {
        if (isSuccess) showToast("Success", "You have successfully logged in", "success");
        if (isError) showToast("Error", "Failed to login with Google", "error");
    }, [isSuccess, isError, toast]);


    return (
        <Button
            onClick={login}
            variant="outline"
            size="lg"
            className="w-full" >
            <img src={googleIcon} alt="Google" width={32} height={32} className="mr-2" />
            <div>
                <span className="mr-1 dark:text-gray-300">Login with</span>
                <span className="dark:text-white font-bold">Google</span>
            </div>
        </Button >
    )
}

export default GoogleLoginButton