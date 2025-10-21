const express = require("express");
const router = express.Router();

router.get("/:awb", async (req, res) => {
  try {
    const { awb } = req.params;

    const response = await fetch(
      `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SHIPROCKET_TOKEN}`,
        },
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        error: "Tracking failed",
        details: data,
      });
    }

    res.json(data);
  } catch (error) {
    console.error("Tracking error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
