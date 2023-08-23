const express = require("express");
const router = express.Router();
const {getDynamicVariable} = require("../audioProcessing")

let dynamicVariable = ""

router.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.write(`data: ${dynamicVariable}\n\n`);

  const interval = setInterval(() => {
    dynamicVariable = getDynamicVariable()
    res.write(`data: ${dynamicVariable}\n\n`);
  }, 100);

  req.on("close", () => {
    clearInterval(interval);
  });
});

module.exports = router;
