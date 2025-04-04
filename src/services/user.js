import { request } from "@/lib/axios"

// GET User Profile | GET
export async function getUserProfile(params) {
    const { data } = await request({
        url: "/user/profile",
        method: "GET",
    })

    return data
}

//PUT User Profile | PUT
export async function updateUserProfile(params) {
    const { data } = await request({
        url: "/user/profile",
        method: "PUT",
        data: params
    })

    return data 
}

// PUT User Avatar | PUT
export async function updateUserAvatar(params) {
    const { data } = await request({
        url: "/user/profile",
        method: "PUT",
        data: params
    })

    return data 
}

// POST USER STUDENT ID | POST
export async function updateStudentId(params) {
    const { data } = await request({
        url: "/user/upload-student-id",
        method: "POST",
        data: params
    })

    return data 
}