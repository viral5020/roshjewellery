import { useEffect, useState } from "react";
import { addressFormControls } from "@/config";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewAddress,
  deleteAddress,
  editaAddress,
  fetchAllAddresses,
} from "@/store/shop/address-slice";
import AddressCard from "./address-card";
import { useToast } from "../ui/use-toast";

const initialAddressFormData = {
  address: "",
  city: "",
  phone: "",
  pincode: "",
  notes: "",
  addressType: "shipping", // Default to shipping
};

function Address({ setCurrentSelectedAddress, selectedId, addressType }) {
  const [formData, setFormData] = useState({
    ...initialAddressFormData,
    addressType: addressType || "shipping", // Set default based on prop
  });
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { addressList } = useSelector((state) => state.shopAddress);
  const { toast } = useToast();

  // Filter addresses based on addressType
  const filteredAddresses = addressList.filter(
    (address) => address.addressType === addressType
  );

  function handleManageAddress(event) {
    event.preventDefault();

    if (addressList.length >= 3 && currentEditedId === null) {
      setFormData(initialAddressFormData);
      toast({
        title: "You can add max 3 addresses",
        variant: "destructive",
      });

      return;
    }

    currentEditedId !== null
      ? dispatch(
          editaAddress({
            userId: user?.id,
            addressId: currentEditedId,
            formData: { ...formData }, // Include addressType
          })
        ).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllAddresses(user?.id));
            setCurrentEditedId(null);
            setFormData({ ...initialAddressFormData, addressType: addressType || "shipping" });
            toast({
              title: "Address updated successfully",
            });
          }
        })
      : dispatch(
          addNewAddress({
            ...formData,
            userId: user?.id,
          })
        ).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllAddresses(user?.id));
            setFormData({ ...initialAddressFormData, addressType: addressType || "shipping" });
            toast({
              title: "Address added successfully",
            });
          }
        });
  }

  function handleDeleteAddress(getCurrentAddress) {
    dispatch(
      deleteAddress({ userId: user?.id, addressId: getCurrentAddress._id })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllAddresses(user?.id));
        toast({
          title: "Address deleted successfully",
        });
      }
    });
  }

  function handleEditAddress(getCurrentAddress) {
    setCurrentEditedId(getCurrentAddress?._id);
    setFormData({
      ...formData,
      address: getCurrentAddress?.address,
      city: getCurrentAddress?.city,
      phone: getCurrentAddress?.phone,
      pincode: getCurrentAddress?.pincode,
      notes: getCurrentAddress?.notes,
      addressType: getCurrentAddress?.addressType || "shipping", // Set addressType
    });
  }

  function isFormValid() {
    return Object.keys(formData)
      .map((key) => formData[key].trim() !== "")
      .every((item) => item);
  }

  useEffect(() => {
    dispatch(fetchAllAddresses(user?.id));
  }, [dispatch]);

  console.log(addressList, "addressList");

  return (
    <div className="flex flex-col gap-6">
      {/* Address List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
        {filteredAddresses && filteredAddresses.length > 0
          ? filteredAddresses.map((singleAddressItem) => (
              <AddressCard
                key={singleAddressItem._id}
                selectedId={selectedId}
                handleDeleteAddress={handleDeleteAddress}
                addressInfo={singleAddressItem}
                handleEditAddress={handleEditAddress}
                setCurrentSelectedAddress={setCurrentSelectedAddress}
              />
            ))
          : null}
      </div>

      {/* Add / Edit Form */}
      <div className="bg-white/40 border border-rosh-primary/10 p-6 md:p-8 mt-2">
        <h3 className="font-serif text-xl italic text-rosh-primary mb-6 border-b border-rosh-primary/10 pb-4">
          {currentEditedId !== null ? "Edit Address" : "Add New Address"}
        </h3>
        
        <form onSubmit={handleManageAddress} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/70">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter your address"
                className="border-0 border-b border-rosh-primary/20 rounded-none px-0 py-2 focus:outline-none focus:ring-0 outline-none bg-transparent text-sm shadow-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/70">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Enter your city"
                className="border-0 border-b border-rosh-primary/20 rounded-none px-0 py-2 focus:outline-none focus:ring-0 outline-none bg-transparent text-sm shadow-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/70">Pincode</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="Enter your pincode"
                className="border-0 border-b border-rosh-primary/20 rounded-none px-0 py-2 focus:outline-none focus:ring-0 outline-none bg-transparent text-sm shadow-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/70">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter your phone number"
                className="border-0 border-b border-rosh-primary/20 rounded-none px-0 py-2 focus:outline-none focus:ring-0 outline-none bg-transparent text-sm shadow-none"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/70">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Enter any additional notes"
              rows={2}
              className="border-0 border-b border-rosh-primary/20 rounded-none px-0 py-2 focus:outline-none focus:ring-0 outline-none bg-transparent text-sm shadow-none resize-none"
            />
          </div>
          
          <button
            type="submit"
            disabled={!isFormValid()}
            className="w-full bg-rosh-primary text-rosh-background py-4 text-[10px] uppercase tracking-[0.3em] hover:bg-rosh-accent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {currentEditedId !== null ? "Save Changes" : "Save Address"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Address;
