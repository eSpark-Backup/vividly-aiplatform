export const handleApiError = (showToast, error) => {
  if (error.response?.data?.errors) {
    const firstErrorMessage = Object.values(error.response.data.errors)[0]
    showToast("Error", firstErrorMessage, "error")
  } else {
    showToast("Error", "An unexpected error occurred", "error")
  }
}

