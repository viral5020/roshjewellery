import ProductImageUpload from "@/components/admin-view/image-upload";
import { Button } from "@/components/ui/button";
import { addFeatureImage, getFeatureImages, deleteFeatureImage } from "@/store/common-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const CURATED_CATEGORIES = [
  { id: 'earrings', label: 'Earrings', type: 'curated_earrings' },
  { id: 'pendants', label: 'Pendants', type: 'curated_pendants' },
  { id: 'rings', label: 'Rings', type: 'curated_rings' },
  { id: 'cuffs', label: 'Cuffs', type: 'curated_cuffs' },
  { id: 'bracelets', label: 'Bracelets', type: 'curated_bracelets' },
  { id: 'chains', label: 'Chains', type: 'curated_chains' },
  { id: 'cufflinks', label: 'Cufflinks', type: 'curated_cufflinks' },
  { id: 'anklets', label: 'Anklets', type: 'curated_anklets' },
];

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
  const curatedImages = featureImageList ? featureImageList.filter(img => img.type?.startsWith('curated_')) : [];

  function handleUploadFeatureImage() {
    if (imageType === 'banner' && bannerImages.length >= 1) {
      toast({
        title: "Maximum limit reached",
        description: "You can only upload 1 banner video.",
        variant: "destructive"
      });
      return;
    }

    if (imageType === 'aboutUs' && aboutUsImages.length >= 5) {
      toast({
        title: "Maximum limit reached",
        description: "You can only upload up to 5 About Us images.",
        variant: "destructive"
      });
      return;
    }

    if (imageType.startsWith('curated_')) {
      const existing = featureImageList.find(img => img.type === imageType);
      if (existing) {
        toast({
          title: "Image already exists",
          description: "You have already uploaded an image for this category. Please delete it first.",
          variant: "destructive"
        });
        return;
      }
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
              <SelectGroup>
                <SelectLabel>Curated by Form Categories</SelectLabel>
                {CURATED_CATEGORIES.map(cat => (
                  <SelectItem key={cat.type} value={cat.type}>
                    Curated: {cat.label}
                  </SelectItem>
                ))}
              </SelectGroup>
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
          accept={imageType === 'banner' ? "video/*" : "image/*"}
          label={imageType === 'banner' ? "Banner Video (Max 1)" : "Image"}
          showSubImages={false}
        />
        <Button onClick={handleUploadFeatureImage} className="mt-5 w-full" disabled={!uploadedImageUrl}>
          Upload
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Banner Images</h2>
          <div className="flex flex-col gap-4">
            {bannerImages.length > 0 ? bannerImages.map((featureImgItem) => (
              <div className="relative group" key={featureImgItem._id}>
                {featureImgItem.image.match(/\.(mp4|webm|ogg|mov)$/i) || featureImgItem.image.includes('/video/') ? (
                  <video
                    src={featureImgItem.image}
                    className="w-full h-[150px] object-cover rounded-lg shadow-sm border border-gray-100"
                    autoPlay muted loop playsInline
                  />
                ) : (
                  <img
                    src={featureImgItem.image}
                    className="w-full h-[150px] object-cover rounded-lg shadow-sm border border-gray-100"
                  />
                )}
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
                  className="w-full h-[150px] object-cover rounded-lg shadow-sm border border-gray-100"
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

        <div>
          <h2 className="text-xl font-bold mb-4">Curated Categories</h2>
          <div className="flex flex-col gap-4">
            {curatedImages.length > 0 ? curatedImages.map((featureImgItem) => (
              <div className="relative group" key={featureImgItem._id}>
                <img
                  src={featureImgItem.image}
                  className="w-full h-[150px] object-cover rounded-lg shadow-sm border border-gray-100"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none">
                  <span className="text-white font-medium uppercase tracking-wider text-sm">
                    {featureImgItem.type.replace('curated_', '')}
                  </span>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onClick={() => handleDeleteFeatureImage(featureImgItem._id)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            )) : <p className="text-gray-500">No curated category images uploaded yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

