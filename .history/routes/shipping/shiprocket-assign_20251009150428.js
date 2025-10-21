const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { shipment_id, courier_id } = req.body;

    if (!shipment_id || !courier_id) {
      return res.status(400).json({ error: "Missing shipment_id or courier_id" });
    }

    const response = await fetch(
      "https://apiv2.shiprocket.in/v1/external/courier/assign/awb",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SHIPROCKET_TOKEN}`,
        },
        body: JSON.stringify({ shipment_id, courier_id }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        error: "Failed to assign courier",
        details: data,
      });
    }

    res.json(data);
  } catch (error) {
    console.error("Assign courier error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
