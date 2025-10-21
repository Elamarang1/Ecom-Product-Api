const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const Razorpay = require('razorpay');
const Product = require('./models/product');
const checkoutRoutes = require('./routes/checkout');
const shippingRoutes = require('./routes/shipping');
const fetch = require("node-fetch");


// shipping API's
const shiprocketRates = require("./routes/shipping/shiprocket-rates");
const shiprocketOrder = require("./routes/shipping/shiprocket-order");
const shiprocketAssign = require("./routes/shipping/shiprocket-assign");
const shiprocketLabel = require("./routes/shipping/shiprocket-label");
const shiprocketPickup = require("./routes/shipping/shiprocket-pickup");
const shiprocketTrack = require("./routes/shipping/shiprocket-track");


const cloudinary = require('cloudinary').v2;
var cors = require('cors')
const app = express();
app.use(cors('*'));
const PORT = 3000;




// Cloudinary config
cloudinary.config({
  cloud_name: 'dr0ami0f0',
  api_key: '814353659674167',
  api_secret: 'wRTuc5wN8tMhhvPO99zc0a73qv4'
});


const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `image_${uniqueSuffix}_${file.originalname}`);
  }
});
const upload = multer({ storage: storage });


const razorpay = new Razorpay({
  key_id: 'rzp_live_R7CILED5jrwg1o',
  key_secret: 'bGKhX4qlJMVSYOsVfFTu85Gh',
});

mongoose.connect(
  'mongodb+srv://softguiding:1uGWqXpyeGkZVYXf@cluster0.vzuo5fk.mongodb.net/product_db?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000
  }
)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Error:', err));


app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// let imageIdCounter = 111;
// let variantIdCounter = 101;

// Create uploads directory if not exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

let imageIdCounter = 111;
let variantIdCounter = 101;



// Helper: Upload Base64 image to Cloudinary
async function uploadToCloudinary(base64Str, imageId) {
  try {
    const result = await cloudinary.uploader.upload(base64Str, {
      folder: 'products',
      public_id: `image_${imageId}`,
      overwrite: true
    });
    return result.secure_url;
  } catch (err) {
    console.error('❌ Cloudinary Upload Error:', err);
    return null;
  }
}

// Helper: Save image
function saveBase64Image(base64Str, imageId) {
  const matches = base64Str.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
  if (!matches) return null;

  const ext = matches[1].split('/')[1];
  const data = matches[2];
  const filename = `image_${imageId}.${ext}`;
  const filepath = path.join(uploadDir, filename);

  fs.writeFileSync(filepath, Buffer.from(data, 'base64'));
  return `uploads/${filename}`;
}





// CREATE
// app.post('/api/products', async (req, res) => {
//   try {
//     const payload = req.body;

//     const images = [];
//     const variants = [];

//     (payload["images Details"] || []).forEach(image => {
//       const imageId = imageIdCounter++;
//       const variantIds = [];

//       const filePath = saveBase64Image(image.src, imageId);

//       image["variant Details"].forEach(variant => {
//         const variantId = variantIdCounter++;
//         variants.push({
//           sku: variant.sku,
//           size: variant.size,
//           color: variant.color,
//           image_id: imageId
//         });
//         variantIds.push(variantId);
//       });

//       images.push({
//         image_id: imageId,
//         alt: image.alt,
//         src: filePath,
//         variant_id: variantIds
//       });
//     });

//     const product = new Product({
//       title: payload.title,
//       description: payload.description,
//       type: payload.type,
//       brand: payload.brand,
//       collection: payload.collection || [],
//       category: payload.category,
//       price: Number(payload.price),
//       sale: payload.sale || false,
//       discount: payload.discount,
//       stock: Number(payload.stock),
//       new: payload.newProduct || false,
//       tags: [...(payload.tags || []), payload.brand || ''],
//       variants,
//       images
//     });

//     await product.save();
//     res.status(201).json({ message: 'Product created', data: product });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });



// CREATE product
app.post('/api/products', async (req, res) => {
  try {
    const payload = req.body;

    const images = [];
    const variants = [];

    for (const image of (payload["images Details"] || [])) {
      const imageId = imageIdCounter++;
      const variantIds = [];

      const fileUrl = await uploadToCloudinary(image.src, imageId);

      for (const variant of image["variant Details"]) {
        const variantId = variantIdCounter++;
        variants.push({
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          image_id: imageId
        });
        variantIds.push(variantId);
      }

      images.push({
        image_id: imageId,
        alt: image.alt,
        src: fileUrl,
        variant_id: variantIds
      });
    }

    const product = new Product({
      title: payload.title,
      description: payload.description,
      type: payload.type,
      brand: payload.brand,
      collection: payload.collection || [],
      category: payload.category,
      price: Number(payload.price),
      sale: payload.sale || false,
      discount: payload.discount,
      stock: Number(payload.stock),
      new: payload.newProduct || false,
      tags: [...(payload.tags || []), payload.brand || ''],
      variants,
      images
    });

    await product.save();
    res.status(201).json({ message: 'Product created', data: product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// FILTER PRODUCTS by brand, minPrice, maxPrice
app.get('/api/products/filter', async (req, res) => {
  try {
    let { brand, minPrice, maxPrice } = req.query;

    const filter = {};

    // Normalize brand
    if (brand) {
      if (typeof brand === 'string') {
        // single brand
        filter.brand = brand;
      } else if (Array.isArray(brand)) {
        // multiple brands
        filter.brand = { $in: brand };
      }
    }

    // Normalize price
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    console.error('Filter Error:', err);
    res.status(500).json({ error: err.message });
  }
});


// READ ALL
app.get('/api/products', async (req, res) => {
  try {
    const allProducts = await Product.find();
    res.json(allProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// app.put('/api/products/:id', async (req, res) => {
//   try {
//     const payload = req.body;

//     const images = [];
//     const variants = [];

//     (payload["images Details"] || []).forEach(image => {
//       const imageId = imageIdCounter++;
//       const variantIds = [];

//       let filePath = image.src;

//       if (image.src && image.src.startsWith("data:image")) {
//         filePath = saveBase64Image(image.src, imageId);
//       }

//       image["variant Details"].forEach(variant => {
//         const variantId = variantIdCounter++;
//         variants.push({
//           sku: variant.sku,
//           size: variant.size,
//           color: variant.color,
//           image_id: imageId
//         });
//         variantIds.push(variantId);
//       });

//       images.push({
//         image_id: imageId,
//         alt: image.alt || 'image not found.',
//         src: filePath,
//         variant_id: variantIds
//       });
//     });

//     const updated = await Product.findByIdAndUpdate(
//       req.params.id,
//       {
//         title: payload.title,
//         description: payload.description,
//         type: payload.type,
//         brand: payload.brand,
//         collection: payload.collection || [],
//         category: payload.category,
//         price: Number(payload.price),
//         sale: payload.sale || false,
//         discount: payload.discount,
//         stock: Number(payload.stock),
//         new: payload.newProduct || false,
//         tags: [...(payload.tags || []), payload.brand || ''],
//         variants,
//         images
//       },
//       { new: true }
//     );

//     if (!updated) return res.status(404).json({ error: 'Product not found' });

//     res.json({ message: 'Product updated', data: updated });
//   } catch (err) {
//     console.error('Update Error:', err);
//     res.status(500).json({ error: err.message });
//   }
// });






// DELETE




// UPDATE product
app.put('/api/products/:id', async (req, res) => {
  try {
    const payload = req.body;
    const images = [];
    const variants = [];

    for (const image of (payload["images Details"] || [])) {
      const imageId = imageIdCounter++;
      const variantIds = [];

      let fileUrl = image.src;
      if (image.src && image.src.startsWith("data:image")) {
        fileUrl = await uploadToCloudinary(image.src, imageId);
      }

      for (const variant of image["variant Details"]) {
        const variantId = variantIdCounter++;
        variants.push({
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          image_id: imageId
        });
        variantIds.push(variantId);
      }

      images.push({
        image_id: imageId,
        alt: image.alt || 'image not found.',
        src: fileUrl,
        variant_id: variantIds
      });
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        title: payload.title,
        description: payload.description,
        type: payload.type,
        brand: payload.brand,
        collection: payload.collection || [],
        category: payload.category,
        price: Number(payload.price),
        sale: payload.sale || false,
        discount: payload.discount,
        stock: Number(payload.stock),
        new: payload.newProduct || false,
        tags: [...(payload.tags || []), payload.brand || ''],
        variants,
        images
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Product not found' });

    res.json({ message: 'Product updated', data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.delete('/api/products/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });

    // Delete images from disk
    deleted.images.forEach(img => {
      const filePath = path.join(__dirname, img.src);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// // DELETE
// app.delete('/api/products/:id', async (req, res) => {
//   try {
//     const deleted = await Product.findByIdAndDelete(req.params.id);
//     if (!deleted) return res.status(404).json({ error: 'Product not found' });

//     // Delete images from disk
//     deleted.images.forEach(img => {
//       const filePath = path.join(__dirname, img.src);
//       if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
//     });

//     res.json({ message: 'Product deleted' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });



app.post('/api/razorpay/order', async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;

    if (!amount || !currency || !receipt) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const options = {
      amount: amount,
      currency,
      receipt,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('❌ Razorpay Order Error:', error);
    res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
});
app.use('/api/checkout', checkoutRoutes);
// shipping routes
app.use("/shipping/rates", shiprocketRates);
app.use("/shipping/order", shiprocketOrder);
app.use("/shipping/assign", shiprocketAssign);
app.use("/shipping/label", shiprocketLabel);
app.use("/shipping/pickup", shiprocketPickup);
app.use("/shipping/track", shiprocketTrack);


// START SERVER
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});


// 123











