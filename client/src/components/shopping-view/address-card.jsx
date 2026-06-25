
function AddressCard({
  addressInfo,
  handleDeleteAddress,
  handleEditAddress,
  setCurrentSelectedAddress,
  selectedId,
  onSelect,
}) {
  const isSelected = selectedId?._id === addressInfo?._id;

  return (
    <div
      onClick={() => {
        if (onSelect) {
          onSelect(addressInfo);
        }
        if (setCurrentSelectedAddress) {
          setCurrentSelectedAddress(addressInfo);
        }
      }}
      className={`cursor-pointer transition-all duration-500 p-6 flex flex-col justify-between ${
        isSelected 
          ? "bg-rosh-primary/[0.03] border border-rosh-primary/30" 
          : "bg-white/40 border border-rosh-primary/10 hover:border-rosh-primary/30"
      }`}
    >
      <div className="flex flex-col gap-2 mb-4 text-rosh-primary">
        <div className="flex justify-between items-center mb-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/50">
            {addressInfo?.addressType === "shipping" ? "Shipping Address" : "Billing Address"}
          </p>
          {isSelected && (
            <div className="w-1.5 h-1.5 bg-rosh-primary"></div>
          )}
        </div>
        
        <p className="text-sm font-light"><span className="text-[10px] uppercase tracking-[0.1em] text-rosh-primary/50 mr-2">Address</span> {addressInfo?.address}</p>
        <p className="text-sm font-light"><span className="text-[10px] uppercase tracking-[0.1em] text-rosh-primary/50 mr-2">City</span> {addressInfo?.city}</p>
        <p className="text-sm font-light"><span className="text-[10px] uppercase tracking-[0.1em] text-rosh-primary/50 mr-2">Pincode</span> {addressInfo?.pincode}</p>
        <p className="text-sm font-light"><span className="text-[10px] uppercase tracking-[0.1em] text-rosh-primary/50 mr-2">Phone</span> {addressInfo?.phone}</p>
        {addressInfo?.notes && (
          <p className="text-sm font-light"><span className="text-[10px] uppercase tracking-[0.1em] text-rosh-primary/50 mr-2">Notes</span> {addressInfo?.notes}</p>
        )}
      </div>
      
      <div className="flex justify-start gap-6 border-t border-rosh-primary/10 pt-4 mt-2">
        <button 
          onClick={(e) => { e.stopPropagation(); handleEditAddress(addressInfo); }}
          className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/50 hover:text-rosh-primary transition-colors"
        >
          Edit
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addressInfo); }}
          className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/50 hover:text-rosh-accent transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export default AddressCard;