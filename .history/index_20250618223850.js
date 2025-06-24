const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Simulated database
let products = [];
let productIdCounter = 1;
let variantIdCounter = 101;
let imageIdCounter = 111;

// Helper to save base64 image and return file path
function saveBase64Image(base64Str, imageId) {
  const matches = base64Str.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
  if (!matches) return null;

  const ext = matches[1].split('/')[1]; // png, jpeg
  const data = matches[2];
  const filename = `image_${imageId}.${ext}`;
  const filepath = path.join(uploadDir, filename);

  fs.writeFileSync(filepath, Buffer.from(data, 'base64'));
  return `uploads/${filename}`; // Public URL path
}

// API to create product
app.post('/api/products', (req, res) => {
  const payload = req.body;

  const productId = productIdCounter++;
  const product = {
    id: productId,
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
    variants: [],
    images: []
  };

  (payload["images Details"] || []).forEach(image => {
    const imageId = imageIdCounter++;
    const variantIds = [];

    // Save image to disk and get file path
    const filePath = saveBase64Image(image.src, imageId);

    image["variant Details"].forEach(variant => {
      const variantId = variantIdCounter++;

      product.variants.push({
        variant_id: variantId,
        id: productId,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        image_id: imageId
      });

      variantIds.push(variantId);
    });

    product.images.push({
      image_id: imageId,
      id: productId,
      alt: image.alt,
      src: filePath, // saved file path instead of base64
      variant_id: variantIds
    });
  });

  products.push(product);

  res.status(201).json({
    message: 'Product created and image saved successfully',
    data: product
  });
});

// Get all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
