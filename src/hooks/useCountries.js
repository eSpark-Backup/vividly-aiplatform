import { useMutation, useQuery } from "@tanstack/react-query";
import { createCountry, deleteCountry, getCountries, updateCountry } from "../services/countries";



const useCountries = () => {
    return useQuery({
        queryKey: ["countries"],
        queryFn: getCountries,
    });
}

const useCreateCountry = () => {
    return useMutation({
        mutationKey: ["createCountry"],
        mutationFn: createCountry,
    });
}

const useUpdateCountry = () => {
    return useMutation({
        mutationKey: ["updateCountry"],
        mutationFn: updateCountry,
    });
}

const useDeleteCountry = () => {
    return useMutation({
        mutationKey: ["deleteCountry"],
        mutationFn: deleteCountry,
    });
}



export { useCountries, useCreateCountry, useUpdateCountry, useDeleteCountry };



