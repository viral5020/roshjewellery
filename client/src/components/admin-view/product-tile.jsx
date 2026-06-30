import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";

function AdminProductTile({
  product,
  setFormData,
  setOpenCreateProductsDialog,
  setCurrentEditedId,
  handleDelete,
  setSubImages,
  handleToggleStatus,
}) {
  return (
    <Card className="w-full max-w-sm mx-auto"> 
      <div>
        <div className="relative">
          <img
            src={product?.image}
            alt={product?.title}
            className="w-full h-[300px] object-cover rounded-t-lg"
          />
        </div>
        <CardContent>
          <h2 className="text-xl font-bold mb-2 mt-2">{product?.title}</h2>
          
          {/* Category Name */}
          {product?.category?.name && (
            <p className="text-sm text-gray-500 mb-2">{product?.category?.name}</p>
          )}

          <div className="flex justify-between items-center mb-2">
            <span
              className={`${
                product?.salePrice > 0 ? "line-through" : ""
              } text-lg font-semibold text-primary`}
            >
              ₹{product?.price}
            </span>
            {product?.salePrice > 0 ? (
              <span className="text-lg font-bold">₹{product?.salePrice}</span>
            ) : null}
          </div>

          {/* Quick Toggles */}
          {handleToggleStatus && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
              <Badge 
                className="cursor-pointer select-none"
                variant={product?.isBestSeller ? "default" : "outline"}
                onClick={() => handleToggleStatus(product._id, 'isBestSeller', !product?.isBestSeller)}
              >
                Best Seller
              </Badge>
              <Badge 
                className="cursor-pointer select-none"
                variant={product?.isNewArrival ? "default" : "outline"}
                onClick={() => handleToggleStatus(product._id, 'isNewArrival', !product?.isNewArrival)}
              >
                New Arrival
              </Badge>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Button
            onClick={() => {
              setOpenCreateProductsDialog(true);
              setCurrentEditedId(product?._id);
              setFormData(product);
              setSubImages(product?.subImages || []);
            }}
          >
            Edit
          </Button>
          <Button onClick={() => handleDelete(product?._id)}>Delete</Button>
        </CardFooter>
      </div>
    </Card>
  );
}

export default AdminProductTile;
