const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { shipment_ids } = req.body; // array of shipment IDs

    const response = await fetch(
      "https://apiv2.shiprocket.in/v1/external/courier/generate/pickup",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SHIPROCKET_TOKEN}`,
        },
        body: JSON.stringify({ shipment_id: shipment_ids }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        error: "Pickup scheduling failed",
        details: data,
      });
    }

    res.json(data);
  } catch (error) {
    console.error("Pickup scheduling error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
