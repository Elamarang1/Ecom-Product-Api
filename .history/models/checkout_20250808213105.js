const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema({
  sku: String,
  size: String,
  color: String,
  image_id: Number
}, { _id: false });

const ImageSchema = new mongoose.Schema({
  image_id: Number,
  alt: String,
  src: String,
  variant_id: [Number]
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  _id: String,
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
  images: [ImageSchema],
  __v: Number,
  quantity: Number
}, { _id: false });

const CheckoutSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  country: { type: String, required: true },
  address: { type: String, required: true },
  town: { type: String, required: true },
  state: { type: String, required: true },
  postalcode: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  products: [ProductSchema],
}, { timestamps: true });

module.exports = mongoose.model('Checkout', CheckoutSchema);
