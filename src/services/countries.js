import { request } from "@/lib/axios"

export async function getCountries() {
    const { data } = await request({
        url: "/all",
        method: "GET",
    })

    return data
}

// POST 
export async function createCountry(country) {
    const { data } = await request({
        url: "/countries",
        method: "POST",
        data: country
    })

    return data
}

// PUT
export async function updateCountry(country) {
    const { data } = await request({
        url: `/countries/${country.id}`,
        method: "PUT",
        data: country
    })

    return data
}


// DELETE
export async function deleteCountry(id) {
    const { data } = await request({
        url: `/countries/${id}`,
        method: "DELETE"
    })

    return data
}
