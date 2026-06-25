import { UploadCloudIcon, XIcon, VideoIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import axios from "axios";

function ProductVideoUpload({
  uploadedVideoUrl,
  setUploadedVideoUrl,
}) {
  const [videoLoadingState, setVideoLoadingState] = useState(false);
  const inputRef = useRef(null);

  function handleVideoFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 100 * 1024 * 1024; // 100MB limit
    if (file.size > maxSize) {
      alert("Video size should be less than 100MB");
      return;
    }

    uploadVideoToCloudinary(file);
  }

  async function uploadVideoToCloudinary(file) {
    setVideoLoadingState(true);
    try {
      const data = new FormData();
      data.append("my_file", file);
      const response = await axios.post(
        "/api/admin/products/upload-image",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response?.data?.success) {
        setUploadedVideoUrl(response.data.result.url);
      } else {
        throw new Error(response.data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("Failed to upload video. Please try again.");
    } finally {
      setVideoLoadingState(false);
    }
  }

  function handleRemoveVideo() {
    setUploadedVideoUrl("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Product Video (Optional)</Label>
      <div className="border-2 border-dashed rounded-lg p-4">
        {videoLoadingState ? (
          <div className="flex flex-col items-center justify-center gap-2 py-4">
            <Skeleton className="w-full h-12" />
            <p className="text-sm text-muted-foreground">Uploading video...</p>
          </div>
        ) : uploadedVideoUrl ? (
          <div className="relative">
            <video
              src={uploadedVideoUrl}
              controls
              className="w-full max-h-64 rounded-lg object-contain bg-black"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-600 rounded-full"
              onClick={handleRemoveVideo}
              type="button"
            >
              <XIcon className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Label
            htmlFor="video-upload"
            className="flex flex-col items-center justify-center cursor-pointer py-4 gap-2"
          >
            <VideoIcon className="w-10 h-10 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Click to upload a product video
            </span>
            <span className="text-xs text-muted-foreground">
              MP4, WebM, MOV — Max 100MB
            </span>
            <Input
              id="video-upload"
              ref={inputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoFileChange}
              className="hidden"
            />
          </Label>
        )}
      </div>
    </div>
  );
}

export default ProductVideoUpload;
