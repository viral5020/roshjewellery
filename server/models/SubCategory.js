const mongoose = require("mongoose");

const SubcategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { timestamps: true }
);

// Properly export the model (prevent OverwriteModelError)
module.exports = mongoose.models.Subcategory || mongoose.model("Subcategory", SubcategorySchema);
