const express = require("express");
const router = express.Router();
require("dotenv").config();

// Shiprocket Shipping Rate API
router.post("/", async (req, res) => {
  try {
    const { pickup_postcode, delivery_postcode, cod, weight } = req.body;

    if (!pickup_postcode || !delivery_postcode || !weight) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const response = await fetch(
      "https://apiv2.shiprocket.in/v1/external/courier/serviceability/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SHIPROCKET_TOKEN}`, // loaded from .env
        },
        body: JSON.stringify({
          pickup_postcode,
          delivery_postcode,
          cod: cod || 0, // Default 0 if not provided
          weight,
        }),
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Failed to fetch from Shiprocket",
        details: await response.text(),
      });
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error("Shipping rate error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
