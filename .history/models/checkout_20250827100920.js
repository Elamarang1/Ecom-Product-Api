// const mongoose = require('mongoose');

// const VariantSchema = new mongoose.Schema({
//   sku: String,
//   size: String,
//   color: String,
//   image_id: Number
// }, { _id: false });

// const ImageSchema = new mongoose.Schema({
//   image_id: Number,
//   alt: String,
//   src: String,
//   variant_id: [Number]
// }, { _id: false });

// const ProductSchema = new mongoose.Schema({
//   _id: String,
//   title: String,
//   description: String,
//   type: String,
//   brand: String,
//   collection: [String],
//   category: String,
//   price: Number,
//   sale: Boolean,
//   discount: String,
//   stock: Number,
//   new: Boolean,
//   tags: [String],
//   variants: [VariantSchema],
//   images: [ImageSchema],
//   __v: Number,
//   quantity: Number
// }, { _id: false });

// const CheckoutSchema = new mongoose.Schema({
//   firstname: { type: String, required: true },
//   lastname: { type: String, required: true },
//   email: { type: String, required: true },
//   phone: { type: String, required: true },
//   country: { type: String, required: true },
//   address: { type: String, required: true },
//   town: { type: String, required: true },
//   state: { type: String, required: true },
//   postalcode: { type: String, required: true },
//   paymentMethod: { type: String, required: true },
//   products: [ProductSchema],
// }, { timestamps: true });

// module.exports = mongoose.model('Checkout', CheckoutSchema);





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

// Shipping schema
const ShippingSchema = new mongoose.Schema({
  label: String,
  rate: Number,
  etd: String,
  estimated_delivery_days: String,
  courier: {
    air_max_weight: String,
    api_edd: Number,
    assured_amount: Number,
    base_courier_id: mongoose.Schema.Types.Mixed,
    base_weight: String,
    blocked: Number,
    call_before_delivery: String,
    charge_weight: Number,
    city: String,
    cod: Number,
    cod_charges: Number,
    cod_multiplier: Number,
    cost: String,
    courier_company_id: Number,
    courier_name: String,
    courier_type: String,
    coverage_charges: Number,
    cutoff_time: String,
    delivery_boy_contact: String,
    delivery_performance: Number,
    description: String,
    edd: String,
    edd_fallback: mongoose.Schema.Types.Mixed,
    entry_tax: Number,
    estimated_delivery_days: String,
    etd: String,
    etd_hours: Number,
    freight_charge: Number,
    id: Number,
    is_custom_rate: Number,
    is_hyperlocal: Boolean,
    is_international: Number,
    is_rto_address_available: Boolean,
    is_surface: Boolean,
    local_region: Number,
    metro: Number,
    min_weight: Number,
    mode: Number,
    new_edd: Number,
    odablock: Boolean,
    other_charges: Number,
    others: String,
    pickup_availability: String,
    pickup_performance: Number,
    pickup_priority: String,
    pickup_supress_hours: Number,
    pod_available: String,
    postcode: String,
    qc_courier: Number,
    rank: String,
    rate: Number,
    rating: Number,
    realtime_tracking: String,
    region: Number,
    rto_charges: Number,
    rto_performance: Number,
    seconds_left_for_pickup: Number,
    secure_shipment_disabled: Boolean,
    ship_type: Number,
    state: String,
    suppress_date: String,
    suppress_text: String,
    suppression_dates: mongoose.Schema.Types.Mixed,
    surface_max_weight: String,
    tracking_performance: Number,
    volumetric_max_weight: mongoose.Schema.Types.Mixed,
    weight_cases: Number,
    zone: String
  }
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
  shipping: ShippingSchema   // 🔹 Added shipping here
}, { timestamps: true });

module.exports = mongoose.model('Checkout', CheckoutSchema);
