import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUpdateUserAvatar, useUpdateUserProfile } from "@/hooks/useUser";
import { handleApiError } from "@/lib/apiErrorHandler";
import { formatDate } from "@/lib/utils";
import { profileSchema } from "@/schema";
import { useUserStore } from "@/store/useUserStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import { useRef } from "react";
import { useForm } from "react-hook-form";

const Profile = () => {
    const {
        avatar,
        firstName,
        lastName,
        phone,
        address,
        city,
        birthdate,
    } = useUserStore()
    const { mutate: UpdateUserProfile, isPending } = useUpdateUserProfile()
    const { mutate: UpdateUserAvatar, isPending: isPendingAvatar } = useUpdateUserAvatar()
    const { toast } = useToast();

    const fileInputRef = useRef(null)

    const showToast = (title, description, type) => {
        toast({ title, description, type });
    };

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        setValue
    } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            first_name: firstName,
            last_name: lastName,
            phone: phone || "",
            address: address || "",
            city: city || "",
            birthdate: new Date(birthdate),
        },
    });

    const onSubmit = (data) => {

        const formatedData = {
            ...data,
            birthdate: formatDate(data.birthdate),
        }

        if (!formatedData.phone) {
            delete formatedData.phone
        }

        UpdateUserProfile(formatedData, {
            onSuccess: () => {
                showToast("Success", "Your profile has been updated successfully", "success");
            },
            onError: (error) => {
                handleApiError(showToast, error);
            }
        })
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }


    const handleFileChange = (event) => {
        const file = event.target.files?.[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showToast("Error", "File size should not exceed 5MB", "error")
                return
            }
            if (!["image/jpeg", "image/png"].includes(file.type)) {
                showToast("Error", "Only JPEG or PNG files are allowed", "error")
                return
            }
            uploadAvatar(file)
        }
    }

    const uploadAvatar = (file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            const binaryString = e.target?.result
            if (typeof binaryString === "string") {
                const formData = new FormData()
                formData.append("avatar", file)


                UpdateUserAvatar(formData,
                    {
                        onSuccess: () => {
                            showToast("Success", "Avatar updated successfully", "success")
                        },
                        onError: (error) => {
                            handleApiError(showToast, error)
                        },
                    })
            }
        }
        reader.readAsDataURL(file)
    }


    return (
        <Card>
            <div className="max-w-[720px] m-auto space-y-4 py-6 px-6">
                {/* {USER NAME} */}
                <div>
                    <p className="font-semibold tracking-tight text-lg sm:text-xl">{firstName} {lastName} </p>
                </div>
          

                {/* {USER Avatar} */}

                <div className="flex gap-8 items-center sm:flex-row flex-col">
                    <Avatar className="h-24 w-24 relative">
                        {avatar ? (
                            <AvatarImage
                                className="h-full w-full rounded-full object-cover"
                                src={avatar}
                                alt="Avatar"
                            />
                        ) : (
                            <AvatarFallback className="absolute inset-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                                {firstName?.[0]}
                                {lastName?.[0]}
                            </AvatarFallback>
                        )}
                    </Avatar>

                    <div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/jpeg,image/png"
                            style={{ display: "none" }}
                        />
                        <Button variant="default" className="w-[150px]" onClick={handleAvatarClick} disabled={isPendingAvatar}>
                            {isPendingAvatar ? "Uploading..." : "Change Avatar"}
                        </Button>
                        <p className="text-sm text-gray-500 mt-2">JPEG or PNG, max 5MB</p>
                    </div>

                </div>


                {/* {USER DETAILS} */}
                <p className=" font-bold text-xl">Personal Details</p>

                <div>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* First Name */}
                        <div className="grid grid-cols-1 sm:grid-cols-[8rem,1fr] gap-4 items-center">
                            <Label htmlFor="first_name" className="sm:text-left">
                                First Name
                            </Label>
                            <div>
                                <Input
                                    id="first_name"
                                    className="w-full px-4 py-3"
                                    type="text"
                                    placeholder="First Name"
                                    {...register("first_name")}
                                />
                                {errors.first_name && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.first_name.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Last Name */}
                        <div className="grid grid-cols-1 sm:grid-cols-[8rem,1fr] gap-4 items-center">
                            <Label htmlFor="last_name" className="sm:text-left">
                                Last Name
                            </Label>
                            <div>
                                <Input
                                    className="w-full px-4 py-3"
                                    type="text"
                                    placeholder="Last Name"
                                    {...register("last_name")}
                                />
                                {errors.last_name && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.last_name.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="grid grid-cols-1 sm:grid-cols-[8rem,1fr] gap-4 items-center">
                            <Label htmlFor="phone" className="sm:text-left">
                                Phone
                            </Label>
                            <div>
                                <Input
                                    id="phone"
                                    className="w-full px-4 py-3"
                                    type="tel"
                                    value={watch("phone")}
                                    placeholder="Phone"
                                    onChange={(e) => setValue("phone", e)}
                                />
                                {errors.phone && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Date of Birth */}
                        <div className="grid grid-cols-1 sm:grid-cols-[8rem,1fr] gap-4 items-center">
                            <Label htmlFor="birthdate" className="sm:text-left">
                                Date of Birth
                            </Label>
                            <div >
                                <DatePicker
                                    noStartIcon
                                    placeholder="Pick a Birth Date"
                                    value={watch("birthdate")}
                                    onChange={(date) => setValue("birthdate", date)}
                                    maxDate={new Date()}

                                />
                                {errors.birthdate && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.birthdate.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Address */}
                        <div className="grid grid-cols-1 sm:grid-cols-[8rem,1fr] gap-4 items-center">
                            <Label htmlFor="address" className="sm:text-left">
                                Address
                            </Label>
                            <div>
                                <Input
                                    id="address"
                                    className="w-full px-4 py-3"
                                    type="text"
                                    placeholder="Address"
                                    {...register("address")}
                                />
                                {errors.address && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.address.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* City */}
                        <div className="grid grid-cols-1 sm:grid-cols-[8rem,1fr] gap-4 items-center">
                            <Label htmlFor="city" className="sm:text-left">
                                City
                            </Label>
                            <div>
                                <Input
                                    id="city"
                                    className="w-full px-4 py-3"
                                    type="text"
                                    placeholder="City"
                                    {...register("city")}
                                />
                                {errors.city && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.city.message}
                                    </p>
                                )}
                            </div>
                        </div>



                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <Button
                                isLoading={isPending}
                                size="lg"
                                variant="gradient"
                                type="submit">
                                Save
                            </Button>
                        </div>
                    </form>
                </div>

            </div>
        </Card>
    )

}

export default Profile