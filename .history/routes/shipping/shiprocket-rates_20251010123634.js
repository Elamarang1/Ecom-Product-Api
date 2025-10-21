const express = require("express");
const router = express.Router();
require("dotenv").config();

// Shiprocket Shipping Rate API
router.get("/", async (req, res) => {
  try {
    const { pickup_postcode, delivery_postcode, cod, weight, length, breadth, height } = req.query;

    if (!pickup_postcode || !delivery_postcode || !weight || !length || !breadth || !height) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=${pickup_postcode}&delivery_postcode=${delivery_postcode}&cod=${cod || 0}&weight=${weight}&length=${length}&breadth=${breadth}&height=${height}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SHIPROCKET_TOKEN}`,
      },
    });

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error("Shipping rate error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
