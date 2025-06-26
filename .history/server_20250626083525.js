const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const Product = require('./models/product');
var cors = require('cors')
const app = express();
app.use(cors('*'));
const PORT = 3000;

mongoose.connect('mongodb://localhost:27017/product_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if not exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

let imageIdCounter = 111;
let variantIdCounter = 101;

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
app.post('/api/products', async (req, res) => {
  try {
    const payload = req.body;

    const images = [];
    const variants = [];

    (payload["images Details"] || []).forEach(image => {
      const imageId = imageIdCounter++;
      const variantIds = [];

      const filePath = saveBase64Image(image.src, imageId);

      image["variant Details"].forEach(variant => {
        const variantId = variantIdCounter++;
        variants.push({
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          image_id: imageId
        });
        variantIds.push(variantId);
      });

      images.push({
        image_id: imageId,
        alt: image.alt,
        src: filePath,
        variant_id: variantIds
      });
    });

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

// UPDATE
app.put('/api/products/:id', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product updated', data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
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



// START SERVER
// test
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});














