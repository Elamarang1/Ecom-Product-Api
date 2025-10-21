const express = require('express');
const router = express.Router();




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