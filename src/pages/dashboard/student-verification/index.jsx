import { useState, useRef } from "react";
import { useUserStore } from "@/store/useUserStore";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  CheckCircle,
  XCircle,
  BadgeIcon as IdCard,
  Loader2,
} from "lucide-react";
import { handleApiError } from "@/lib/apiErrorHandler";
import { useUpdateUserStudentId } from "@/hooks/useUser";

const StudentVerification = () => {
  const { studentID, isStudent } = useUserStore();
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const [previewUrl, setPreviewUrl] = useState(studentID || null);
  const [verificationStatus, setVerificationStatus] = useState(
    isStudent ? "verified" : "unverified"
  );

  const { mutate: updateUserStudentId, isPending: isUserStudentIdPending } =
    useUpdateUserStudentId();

  const showToast = (title, description, type) => {
    toast({ title, description, type });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        showToast("Error", "File size should not exceed 5MB", "error");
        return;
      }

      // Validate file type (JPEG or PNG only)
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        showToast("Error", "Only JPEG or PNG files are allowed", "error");
        return;
      }

      uploadStudentId(file);
    }
  };

  const uploadStudentId = (file) => {
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result;
      if (typeof dataUrl === "string") {
        const formData = new FormData();
        formData.append("student_id", file);

        updateUserStudentId(formData, {
          onSuccess: () => {
            setVerificationStatus("verified");
            showToast("Success", "Student ID uploaded successfully", "success");
            setPreviewUrl(dataUrl);
          },
          onError: (error) => {
            handleApiError(showToast, error);
          },
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const renderVerificationStatus = () => {
    switch (verificationStatus) {
      case "verified":
        return (
          <div className="flex items-center gap-1 sm:gap-2 text-green-500 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded-full text-xs sm:text-sm">
            <CheckCircle className="h-4 w-4" />
            <span>Verified</span>
          </div>
        );
      case "pending":
        return (
          <div className="flex items-center gap-1 sm:gap-2 text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30 px-2 py-1 rounded-full text-xs sm:text-sm">
            <Upload className="h-4 w-4" />
            <span>Pending</span>
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center gap-1 sm:gap-2 text-red-500 bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded-full text-xs sm:text-sm">
            <XCircle className="h-4 w-4" />
            <span>Rejected</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 sm:gap-2 text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-full text-xs sm:text-sm">
            <IdCard className="h-4 w-4" />
            <span>Not Verified</span>
          </div>
        );
    }
  };

  return (
    <div className="w-full overflow-hidden">
      <CardHeader className="sm:flex-row sm:items-center sm:justify-between flex-col items-start gap-2">
        <div>
          <CardTitle className="text-lg sm:text-xl">
            Student ID Verification
          </CardTitle>
          <CardDescription className="text-sm mt-1">
            Upload your student ID to verify your student status
          </CardDescription>
        </div>
        <div className="mt-2 sm:mt-0">{renderVerificationStatus()}</div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col items-center space-y-6 w-full">
          {/* ID Card Preview  with Loading State  */}
          <div className="w-full max-w-md aspect-[1.6/1] bg-muted rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/25 relative">
            {previewUrl ? (
              <>
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="Student ID"
                  className="w-full h-full object-contain"
                />

                {/* Loading Overlay */}
                {isUserStudentIdPending && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
                    <Loader2 className="h-10 w-10 text-primary animate-spin mb-2" />
                    <p className="text-sm font-medium">Uploading ID...</p>
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-4">
                <IdCard className="h-12 w-12 md:h-16 md:w-16 mb-2" />
                <p className="text-sm font-medium text-center">
                  No student ID uploaded
                </p>
              </div>
            )}
          </div>

          {/* Upload Instructions */}
          <div className="space-y-2 w-full px-2 sm:px-4">
            <p className="text-center  text-sm text-muted-foreground">
              Please upload a clear image of your student ID card. Make sure all
              details are visible.
            </p>
            <ul className="text-xs text-muted-foreground list-disc px-4 py-2 rounded-md mx-auto max-w-md">
              <li className="mb-1">Image must be JPEG or PNG format</li>
              <li className="mb-1">Maximum file size is 5MB</li>
              <li className="mb-1">Student ID will be verified only once</li>
            </ul>
          </div>

          {/* Upload Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png"
            style={{ display: "none" }}
          />

          <Button
            onClick={handleUploadClick}
            disabled={
              isUserStudentIdPending || verificationStatus === "verified"
            }
            className="w-full max-w-xs"
            size="lg"
            variant={verificationStatus === "verified" ? "outline" : "default"}
          >
            {isUserStudentIdPending
              ? "Uploading..."
              : verificationStatus === "verified"
              ? "Already Verified"
              : "Upload Student ID"}
          </Button>
        </div>
      </CardContent>

      <CardFooter className="flex justify-center border-t pt-4 sm:pt-6 px-4">
        <p className="text-xs text-center text-muted-foreground max-w-md">
          By uploading your student ID, you consent to our verification process.
          Your ID will be stored securely and only used for verification
          purposes.
        </p>
      </CardFooter>
    </div>
  );
};

export default StudentVerification;
