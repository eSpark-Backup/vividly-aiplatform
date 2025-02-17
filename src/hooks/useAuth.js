import { useMutation } from "@tanstack/react-query";
import {
    createAccount,
    createAccountResendVerification,
    createPassword,
    requestResetPassword,
    forgotPasswordVerifyCode,
    resetPassword,
    login,
    logout,
    googleProfile,
    loginWithGoogle
}
    from "../services/auth";

// Create Account | POST
const useCreateAccount = () => {
    return useMutation({
        mutationKey: ["createAccount"],
        mutationFn: createAccount,
    });
}


// Create Account Verify Code | POST
const usecreateAccountResendVerification = () => {
    return useMutation({
        mutationKey: ["createAccountResendVerification"],
        mutationFn: createAccountResendVerification,
    });
}

// Create Password | POST
const useCreatePassword = () => {
    return useMutation({
        mutationKey: ["createPassword"],
        mutationFn: createPassword,
    });
}

// Forgot Password | POST
const useRequestResetPassword = () => {
    return useMutation({
        mutationKey: ["requestResetPassword"],
        mutationFn: requestResetPassword,
    });
}

// Forgot Password Verify Code | POST
const useForgotPasswordVerifyCode = () => {
    return useMutation({
        mutationKey: ["forgotPasswordVerifyCode"],
        mutationFn: forgotPasswordVerifyCode,
    });
}

// Reset Password | POST
const useResetPassword = () => {
    return useMutation({
        mutationKey: ["resetPassword"],
        mutationFn: resetPassword,
    });
}

// login | POST
const useLogin = () => {
    return useMutation({
        mutationKey: ["login"],
        mutationFn: login,
    });
}

// LoginWithGoogle | POST
const useLoginWithGoogle = () => {
    return useMutation({
        mutationKey: ["loginWithGoogle"],
        mutationFn: loginWithGoogle,
    });
}

const useLogout = () => {
    return useMutation({
        mutationKey: ["logout"],
        mutationFn: logout,
    });
}

// Goolge Profile | GET
const useGetGoogleProfile = () => {
    return useMutation({
        mutationKey: ["googleLogin"],
        mutationFn: googleProfile,
    });
}



export {
    useCreateAccount,
    usecreateAccountResendVerification,
    useCreatePassword,
    useRequestResetPassword,
    useForgotPasswordVerifyCode,
    useResetPassword,
    useLogin,
    useLogout,
    useLoginWithGoogle,
    useGetGoogleProfile,
};



