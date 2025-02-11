import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { usecreateAccountResendVerification, useRequestResetPassword } from "@/hooks/useAuth";
import { verifyCodeBgDark, verifyCodeBgLight } from "@/assets";
import { Authlayout } from "@/layout";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/lib/apiErrorHandler";
import { useEffect } from "react";


function VerifyEmailSent() {

    const { toast } = useToast();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const reset = searchParams.get("reset");
    const create = searchParams.get("create");
    const { mutate: resendEmail, isPending: isCreateAccountResedPending } = usecreateAccountResendVerification();
    const { mutate: requestResetPassword, isPending: isResetPasswordPending } = useRequestResetPassword();

    const showToast = (title, description, type) => {
        toast({ title, description, type });
    };

    const handleResntEmail = () => {
        const createData = { email: create };
        const resetData = { email: reset };

        if (create) {
            resendEmail(createData, {
                onSuccess: () => {
                    showToast("Success", "Verification email resent successfully", "success");
                },
                onError: (error) => {
                    handleApiError(showToast, error);
                }
            });
            return;
        }

        if (reset) {
            requestResetPassword(resetData, {
                onSuccess: () => {
                    showToast("Success", "Reset password email resent successfully", "success");
                },
                onError: (error) => {
                    handleApiError(showToast, error);
                }
            });
            return;
        }
    }

    useEffect(() => {
        if (!reset && !create) {
            navigate("/log-in");
        }
    }, []);


    return (
        <Authlayout
            onLightPoster={verifyCodeBgLight}
            onDarkPoster={verifyCodeBgDark}
        >
            <div className="w-full space-y-6">
                {/* Login Form */}
                <div className="space-y-6">
                    <div className="space-y-2">

                        {/* Back to login */}
                        <Link to="/log-in">
                            <div className="flex items-center gap-1 cursor-pointer text-sm dark:text-gray-300">
                                <div>
                                    <ChevronLeft
                                        className="dark:text-gray-300"
                                        size={20} />
                                </div>
                                <p>Back to login</p>
                            </div>
                        </Link>

                        <h1 className="sm:text-2xl text-xl font-semibold tracking-tight dark:text-white uppercase">
                            Verify Email
                        </h1>
                        <p className="text-md dark:text-gray-300">
                            {reset ? "We have sent you an email to reset your password" : "We have sent you an email to verify your account"}
                        </p>
                    </div>

                    <div className="grid gap-4">

                        {/* Submit Button */}
                        <Button
                            onClick={handleResntEmail}
                            isLoading={isCreateAccountResedPending || isResetPasswordPending}
                            size="lg"
                            variant="gradient"
                            type="submit">
                            Resend Email
                        </Button>

                    </div>
                </div>

            </div>
        </Authlayout>
    );
}


export default VerifyEmailSent;