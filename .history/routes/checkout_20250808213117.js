const express = require('express');
const router = express.Router();
const Checkout = require('../models/checkout');

// Create new checkout
router.post('/', async (req, res) => {
  try {
    const checkout = new Checkout(req.body);
    await checkout.save();
    res.status(201).json({ message: 'Checkout created successfully', data: checkout });
  } catch (error) {
    res.status(400).json({ message: 'Error creating checkout', error: error.message });
  }
});

// Get all checkouts
router.get('/', async (req, res) => {
  try {
    const checkouts = await Checkout.find();
    res.json(checkouts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching checkouts', error: error.message });
  }
});

// Get single checkout by ID
router.get('/:id', async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout) return res.status(404).json({ message: 'Checkout not found' });
    res.json(checkout);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching checkout', error: error.message });
  }
});

// Update checkout
router.put('/:id', async (req, res) => {
  try {
    const updated = await Checkout.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Checkout not found' });
    res.json({ message: 'Checkout updated successfully', data: updated });
  } catch (error) {
    res.status(400).json({ message: 'Error updating checkout', error: error.message });
  }
});

// Delete checkout
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Checkout.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Checkout not found' });
    res.json({ message: 'Checkout deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting checkout', error: error.message });
  }
});

module.exports = router;
