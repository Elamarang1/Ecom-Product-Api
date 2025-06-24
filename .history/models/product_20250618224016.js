const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema({
  sku: String,
  size: String,
  color: String,
  image_id: Number
});

const ImageSchema = new mongoose.Schema({
  image_id: Number,
  alt: String,
  src: String,
  variant_id: [Number]
});

const ProductSchema = new mongoose.Schema({
  title: String,
  description: String,
  type: String,
  brand: String,
  collection: [String],
  category: String,
  price: Number,
  sale: Boolean,
  discount: String,
  stock: Number,
  new: Boolean,
  tags: [String],
  variants: [VariantSchema],
  images: [ImageSchema]
});

module.exports = mongoose.model('Product', ProductSchema);
