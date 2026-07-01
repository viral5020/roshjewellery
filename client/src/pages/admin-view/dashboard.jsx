import ProductImageUpload from "@/components/admin-view/image-upload";
import { Button } from "@/components/ui/button";
import { addFeatureImage, getFeatureImages, deleteFeatureImage } from "@/store/common-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

function AdminDashboard() {
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [imageType, setImageType] = useState("banner");
  
  const dispatch = useDispatch();
  const { featureImageList } = useSelector((state) => state.commonFeature);
  const { toast } = useToast();

  const aboutUsImages = featureImageList ? featureImageList.filter(img => img.type === 'aboutUs') : [];
  const bannerImages = featureImageList ? featureImageList.filter(img => !img.type || img.type === 'banner') : [];

  function handleUploadFeatureImage() {
    if (imageType === 'aboutUs' && aboutUsImages.length >= 5) {
      toast({
        title: "Maximum limit reached",
        description: "You can only upload up to 5 About Us images.",
        variant: "destructive"
      });
      return;
    }

    dispatch(addFeatureImage({ image: uploadedImageUrl, type: imageType })).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages());
        setImageFile(null);
        setUploadedImageUrl("");
        toast({ title: "Image added successfully" });
      }
    });
  }

  function handleDeleteFeatureImage(id) {
    dispatch(deleteFeatureImage(id)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages());
        toast({ title: "Image deleted successfully" });
      }
    });
  }

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  return (
    <div>
      <div className="mb-6 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-4">Upload New Image</h2>
        
        <div className="mb-4">
          <Label className="mb-2 block">Select Image Type</Label>
          <Select value={imageType} onValueChange={setImageType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="banner">Banner Image</SelectItem>
              <SelectItem value="aboutUs">About Us Section (Max 5)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ProductImageUpload
          imageFile={imageFile}
          setImageFile={setImageFile}
          uploadedImageUrl={uploadedImageUrl}
          setUploadedImageUrl={setUploadedImageUrl}
          setImageLoadingState={setImageLoadingState}
          imageLoadingState={imageLoadingState}
          isCustomStyling={true}
        />
        <Button onClick={handleUploadFeatureImage} className="mt-5 w-full" disabled={!uploadedImageUrl}>
          Upload
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Banner Images</h2>
          <div className="flex flex-col gap-4">
            {bannerImages.length > 0 ? bannerImages.map((featureImgItem) => (
              <div className="relative group" key={featureImgItem._id}>
                <img
                  src={featureImgItem.image}
                  className="w-full h-[200px] object-cover rounded-lg shadow-sm border border-gray-100"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteFeatureImage(featureImgItem._id)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            )) : <p className="text-gray-500">No banner images uploaded yet.</p>}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">About Us Images ({aboutUsImages.length}/5)</h2>
          <div className="flex flex-col gap-4">
            {aboutUsImages.length > 0 ? aboutUsImages.map((featureImgItem) => (
              <div className="relative group" key={featureImgItem._id}>
                <img
                  src={featureImgItem.image}
                  className="w-full h-[200px] object-cover rounded-lg shadow-sm border border-gray-100"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteFeatureImage(featureImgItem._id)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            )) : <p className="text-gray-500">No about us images uploaded yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
