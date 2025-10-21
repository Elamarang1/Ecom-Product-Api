const express = require('express');
const router = express.Router();



app.post("/api/shipping-rate", async (req, res) => {
  const { pickup_postcode, delivery_postcode, cod, weight } = req.body;

  const response = await fetch(
    "https://apiv2.shiprocket.in/v1/external/courier/serviceability/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.SHIPROCKET_TOKEN}`,
      },
      body: JSON.stringify({
        pickup_postcode,
        delivery_postcode,
        cod,
        weight,
      }),
    }
  );

  const data = await response.json();
  res.json(data);
});

