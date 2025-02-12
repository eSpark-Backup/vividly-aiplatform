import { useGoogleLogin } from "@react-oauth/google";
import { useGetGoogleProfile, useLoginWithGoogle } from "@/hooks/useAuth";
import { googleIcon } from "@/assets"
import { Button } from "./ui/button"
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { handleApiError } from "@/lib/apiErrorHandler";

const GoogleLoginButton = () => {

    const { mutate: getGoogleProfile } = useGetGoogleProfile();
    const { mutate: loginWithGoogle } = useLoginWithGoogle();
    const { setAuth } = useAuthStore()
    const { toast } = useToast();


    const showToast = (title, description, type) => {
        toast({ title, description, type });
    };

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            getGoogleProfile(tokenResponse, {
                onSuccess: (data) => {

                    const { given_name, family_name, email, sub } = data;

                    const googleProfileInfo = {
                        google_id: sub,
                        first_name: given_name,
                        last_name: family_name,
                        email,
                    }

                    loginWithGoogle(googleProfileInfo, {
                        onSuccess: (successData) => {
                            showToast("Success", "Login with Google successful", "success")
                            const { accessToken, refreshToken, expiresAt, user } = successData;
                            setAuth({ accessToken, refreshToken, expiresAt, user })
                        },
                        onError: (error) => {
                            handleApiError(showToast, error);
                        }
                    });

                },
                onError: () => {
                    showToast("Error", "Failed to login with Google", "error")
                }
            });
        },
        onError: () => showToast("Error", "Failed to login with Google", "error"),
        flow: "implicit",
    });

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