const express = require('express');
const router = express.Router();
const Checkout = require('../models/checkout');

// CREATE
router.post('/', async (req, res) => {
  try {
    const checkout = new Checkout(req.body);
    await checkout.save();
    res.status(201).json({ message: 'Checkout created', data: checkout });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ALL
router.get('/', async (req, res) => {
  try {
    const allCheckouts = await Checkout.find().populate('products.productId');
    res.json(allCheckouts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE
router.get('/:id', async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id).populate('products.productId');
    if (!checkout) return res.status(404).json({ error: 'Checkout not found' });
    res.json(checkout);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const updated = await Checkout.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Checkout not found' });
    res.json({ message: 'Checkout updated', data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Checkout.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Checkout not found' });
    res.json({ message: 'Checkout deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
