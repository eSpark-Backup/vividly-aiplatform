import axios from "axios";

const client = axios.create({ baseURL:  "https://restcountries.com/v3.1"});

export const request = ({ ...options }) => {
  const token = localStorage.getItem("token");
  client.defaults.headers.common.Authorization = `Bearer ${token}`;

  return client(options)
    .then((response) => {
      return response; // Extract data from the response
    })
    .catch((error) => {
      // Optional: Log the error for debugging
      console.error("API request error:", error)

      throw error; // Rethrow the error to trigger the React Query onError callback
    });
};
