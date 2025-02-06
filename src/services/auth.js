import { request } from "@/lib/axios"
import axios from "axios"


// Create Account | POST 
export async function createAccount(params) {
    const { data } = await request({
        url: "/createAccount",
        method: "POST",
        data: params
    })

    return data
}


// Create Account Verify Code | POST
export async function createAccountVerifyCode(params) {
    const { data } = await request({
        url: "/createAccountVerifyCode",
        method: "POST",
        data: params
    })

    return data
}

// Create Password | POST
export async function createPassword(params) {
    const { data } = await request({
        url: "/createPassword",
        method: "POST",
        data: params
    })

    return data
}

// Forgot Password | POST
export async function forgotPassword(params) {
    const { data } = await request({
        url: "/forgotPassword",
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
        url: "/resetPassword",
        method: "POST",
        data: params
    })

    return data
}

// Login | POST
export async function login(params) {
    const { data } = await request({
        url: "/login",
        method: "POST",
        data: params
    })

    return data
}

// Google Login | GET
export async function googleLogin(tokenResponse) {
    const { data } = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo",
        {
            headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`,

            }
        }
    )

    return data
}






