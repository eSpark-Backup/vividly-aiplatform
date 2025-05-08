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

// Get User Cards | GET
export async function getUserCards() {
    const { data } = await request({
        url: "/subscription/cards",
        method: "GET",
    })

    return data
}

// Add User Card | POST
export async function addUserCard(params) {
    const { data } = await request({
        url: "/subscription/add-card",
        method: "POST",
        data: params
    })

    return data
}

// Make Card Default | POST
export async function makeCardDefault(params) {
    const { data } = await request({
        url: "/subscription/default-card",
        method: "POST",
        data: params
    })

    return data
}

