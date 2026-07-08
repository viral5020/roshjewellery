import { FileIcon, UploadCloudIcon, XIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import axios from "axios";
import { Skeleton } from "../ui/skeleton";

function ProductImageUpload({
  imageFile,
  setImageFile,
  imageLoadingState,
  uploadedImageUrl,
  setUploadedImageUrl,
  setImageLoadingState,
  isEditMode,
  isCustomStyling = false,
  setSubImages = () => {},
  subImages = [],
  showSubImages = true,
  label = "Main Image",
  accept = "image/*",
}) {
  const [subImageFiles, setSubImageFiles] = useState([]);
  const [uploadedSubImageUrls, setUploadedSubImageUrls] = useState(subImages);
  const [subImageUploading, setSubImageUploading] = useState(false);
  const inputRef = useRef(null);

  // Initialize subImages when editing
  useEffect(() => {
    if (isEditMode && subImages.length > 0) {
      setUploadedSubImageUrls(subImages);
    }
  }, [isEditMode, subImages]);

  function handleMainImageFileChange(event) {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const isVideo = selectedFile.type.startsWith('video/');
      const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        alert(`File size should be less than ${isVideo ? '50MB' : '5MB'}`);
        return;
      }
      setImageFile(selectedFile);
    }
  }

  function handleSubImageFileChange(event) {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert(`Image ${file.name} is too large. Maximum size is 5MB`);
        return false;
      }
      return true;
    });

    if (subImageFiles.length + validFiles.length <= 4) {
      setSubImageFiles([...subImageFiles, ...validFiles]);
    } else {
      alert("You can upload a maximum of 4 sub-images.");
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) setImageFile(droppedFile);
  }

  function handleRemoveImage() {
    setImageFile(null);
    if (setUploadedImageUrl) {
      setUploadedImageUrl("");
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleRemoveSubImage(index) {
    const newSubImages = uploadedSubImageUrls.filter((_, i) => i !== index);
    setUploadedSubImageUrls(newSubImages);
    setSubImages(newSubImages);
  }

  async function uploadImageToCloudinary(file) {
    setImageLoadingState(true);
    try {
      const data = new FormData();
      data.append("my_file", file);
      const response = await axios.post(
        "/api/admin/products/upload-image",
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response?.data?.success) {
        setUploadedImageUrl(response.data.result.url);
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setImageLoadingState(false);
    }
  }

  async function uploadSubImages() {
    setSubImageUploading(true);
    const uploadedUrls = [...uploadedSubImageUrls]; // Keep existing URLs
    
    try {
      for (const file of subImageFiles) {
        const data = new FormData();
        data.append("my_file", file);
        const response = await axios.post(
          "/api/admin/products/upload-image",
          data,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        if (response?.data?.success) {
          uploadedUrls.push(response.data.result.url);
        } else {
          throw new Error(response.data.message || 'Failed to upload sub-image');
        }
      }
      setUploadedSubImageUrls(uploadedUrls);
      setSubImages(uploadedUrls);
      setSubImageFiles([]);
    } catch (error) {
      console.error("Error uploading sub-images:", error);
      alert("Error uploading sub-images. Please try again.");
    } finally {
      setSubImageUploading(false);
    }
  }

  useEffect(() => {
    if (imageFile !== null) uploadImageToCloudinary(imageFile);
  }, [imageFile]);

  useEffect(() => {
    if (subImageFiles.length > 0) {
      uploadSubImages();
    }
  }, [subImageFiles]);

  return (
    <div className="space-y-4">
      {/* Main Image Upload */}
      <div className="space-y-2">
        <Label>{label}</Label>
        <div
          className={`border-2 border-dashed rounded-lg p-4 cursor-pointer`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {imageLoadingState ? (
            <div className="flex items-center justify-center">
              <Skeleton className="w-32 h-32" />
            </div>
          ) : uploadedImageUrl ? (
            <div className="relative">
              {uploadedImageUrl.match(/\.(mp4|webm|ogg|mov)$/i) || uploadedImageUrl.includes('/video/') ? (
                <video
                  src={uploadedImageUrl}
                  className="w-32 h-32 object-cover rounded-lg"
                  autoPlay muted loop playsInline
                />
              ) : (
                <img
                  src={uploadedImageUrl}
                  alt="Uploaded"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 text-red-600 bg-white/50 hover:bg-white"
                onClick={handleRemoveImage}
              >
                <XIcon className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Label
              htmlFor="image-upload"
              className={`flex flex-col items-center justify-center cursor-pointer`}
            >
              <UploadCloudIcon className="w-8 h-8 text-muted-foreground mb-2" />
              <span>Click to upload or drag and drop</span>
              <Input
                id="image-upload"
                type="file"
                accept={accept}
                onChange={handleMainImageFileChange}
                className="hidden"
                ref={inputRef}
              />
            </Label>
          )}
        </div>
      </div>

      {/* Sub Images Upload */}
      {showSubImages && (
        <div className="space-y-2">
          <Label>Sub Images (Max 4)</Label>
          <div className="flex flex-wrap gap-4">
            {uploadedSubImageUrls.map((url, index) => (
              <div key={`existing-${index}`} className="relative w-24 h-24 border-2 border-dashed rounded-lg">
                <img
                  src={url}
                  alt={`Sub Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 text-red-600"
                  onClick={() => handleRemoveSubImage(index)}
                  disabled={subImageUploading}
                >
                  <XIcon className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {subImageFiles.map((file, index) => (
              <div key={`new-${index}`} className="relative w-24 h-24 border-2 border-dashed rounded-lg">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`New Sub Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 text-red-600"
                  onClick={() => handleRemoveSubImage(index)}
                  disabled={subImageUploading}
                >
                  <XIcon className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {uploadedSubImageUrls.length + subImageFiles.length < 4 && (
              <Label
                htmlFor="sub-images-upload"
                className={`flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed rounded-lg ${
                  subImageUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                {subImageUploading ? (
                  <Skeleton className="w-8 h-8 rounded-full" />
                ) : (
                  <>
                    <UploadCloudIcon className="w-8 h-8 text-muted-foreground mb-2" />
                    <span>+</span>
                  </>
                )}
                <Input
                  id="sub-images-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleSubImageFileChange}
                  className="hidden"
                  disabled={subImageUploading}
                />
              </Label>
            )}
          </div>
          {subImageFiles.length > 0 && (
            <Button
              onClick={uploadSubImages}
              disabled={subImageUploading}
              className="mt-2"
            >
              {subImageUploading ? "Uploading..." : "Upload Sub Images"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductImageUpload;
