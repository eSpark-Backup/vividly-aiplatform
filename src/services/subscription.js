import { request } from "@/lib/axios"


// User Subscription Info | GET
export async function getUserSubscriptionInfo(params) {
    const { data } = await request({
        url: "/subscription",
        method: "GET",
    })

    return data
}

// Create Subscription | POST
export async function createSubscription(params) {
    const { data } = await request({
        url: "/subscription/create",
        method: "POST",
        data: params
    })

    return data
}

// Upgrade Subscription | POST
export async function upgradeSubscription(params) {
    const { data } = await request({
        url: "/subscription/upgrade",
        method: "POST",
        data: params
    })

    return data
}

// Cancel Subscription | POST
export async function cancelSubscription(params) {
    const { data } = await request({
        url: "/subscription/cancel",
        method: "POST",
        data: params
    })

    return data
}