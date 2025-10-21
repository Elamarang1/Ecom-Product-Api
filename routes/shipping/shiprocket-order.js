const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const orderData = req.body; // include all fields from frontend

    const response = await fetch(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SHIPROCKET_TOKEN}`,
        },
        body: JSON.stringify(orderData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Order creation failed",
        details: data,
      });
    }

    res.json(data);
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
