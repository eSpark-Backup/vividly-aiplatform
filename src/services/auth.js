import { request } from "@/lib/axios"
import axios from "axios"


// Create Account | POST 
export async function createAccount(params) {
    const { data } = await request({
        url: "/auth/signup",
        method: "POST",
        data: params
    })

    return data
}


// Create Account Verify Code | POST
export async function createAccountResendVerification(params) {
    const { data } = await request({
        url: "/auth/resend-verification",
        method: "POST",
        data: params
    })

    return data
}

// Create Password | POST
export async function createPassword(params) {
    const { data } = await request({
        url: "/auth/verify",
        method: "POST",
        data: params
    })

    return data
}

// Request Reset Password | POST
export async function requestResetPassword(params) {
    const { data } = await request({
        url: "/auth/request-password-reset",
        method: "POST",
        data: params
    })

    return data
}

// Forgot Password Verify Code | POST
export async function forgotPasswordVerifyCode(params) {
    const { data } = await request({
        url: "/forgotPasswordVerifyCode",
        method: "POST",
        data: params
    })

    return data
}

// Reset Password | POST
export async function resetPassword(params) {
    const { data } = await request({
        url: "/auth/reset-password",
        method: "POST",
        data: params
    })

    return data
}

// Login | POST
export async function login(params) {
    const { data } = await request({
        url: "/auth/login",
        method: "POST",
        data: params
    })

    return data
}

// Google Login | POST
export async function loginWithGoogle(params) {
    const { data } = await request({
        url: "/auth/google",
        method: "POST",
        data: params
    })

    return data
}



// Google Profile Fetch | GET
export async function googleProfile(tokenResponse) {
    const { data } = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo",
        {
            headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`,

            }
        }
    )

    return data
}






