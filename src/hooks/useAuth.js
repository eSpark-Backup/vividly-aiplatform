import { useMutation, useQuery } from "@tanstack/react-query";
import {
    createAccount,
    createAccountVerifyCode,
    createPassword,
    forgotPassword,
    forgotPasswordVerifyCode,
    resetPassword,
    login,
    googleLogin
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
const useCreateAccountVerfiyCode = () => {
    return useMutation({
        mutationKey: ["createAccountVerfiyCode"],
        mutationFn: createAccountVerifyCode,
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
const useForgotPassword = () => {
    return useMutation({
        mutationKey: ["forgotPassword"],
        mutationFn: forgotPassword,
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

// Goolge Login | GET
const useGetGoogleProfile = () => {
    return useMutation({
        mutationKey: ["googleLogin"],
        mutationFn: googleLogin,
    });
}



export {
    useCreateAccount,
    useCreateAccountVerfiyCode,
    useCreatePassword,
    useForgotPassword,
    useForgotPasswordVerifyCode,
    useResetPassword,
    useLogin,
    useGetGoogleProfile
};



