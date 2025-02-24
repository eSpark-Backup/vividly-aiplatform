import { request } from "@/lib/axios"

// GET User Profile | GET
export async function getUserProfile(params) {
    const { data } = await request({
        url: "/user/profile",
        method: "GET",
    })

    return data
}