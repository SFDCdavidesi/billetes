const express = require("express");
const router = express.Router();
const banknotes = require("../data/banknotes");

// GET all banknotes
router.get("/", (req, res) => {
  const { country, currency } = req.query;
  let result = banknotes;

  if (country) {
    result = result.filter(
      (note) => note.country.toLowerCase() === country.toLowerCase()
    );
  }

  if (currency) {
    result = result.filter(
      (note) => note.currency.toLowerCase() === currency.toLowerCase()
    );
  }

  res.json(result);
});

// GET a single banknote by id
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const note = banknotes.find((n) => n.id === id);

  if (!note) {
    return res.status(404).json({ error: "Banknote not found" });
  }

  res.json(note);
});

module.exports = router;
