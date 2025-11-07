const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const { protect, authorize } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const departments = await Department.find().sort('name');

    res.json({
      success: true,
      count: departments.length,
      departments,
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
    const { name, code, description } = req.body;

    const department = await Department.create({ name, code, description });

    res.status(201).json({
      success: true,
      department,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
