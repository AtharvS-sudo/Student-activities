const express = require('express');
const router = express.Router();
const Club = require('../models/Club');
const { protect, authorize } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const clubs = await Club.find().sort('name');

    res.json({
      success: true,
      count: clubs.length,
      clubs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, category, description } = req.body;

    const club = await Club.create({ name, category, description });

    res.status(201).json({
      success: true,
      club,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
