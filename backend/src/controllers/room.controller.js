const Room = require("../models/Room");

// @route   POST /api/rooms
// @desc    Create a new room (Admin/Staff only)
// @access  Private
exports.createRoom = async (req, res) => {
  try {
    const {
      name,
      description,
      capacity,
      location,
      amenities,
      pricePerHour,
      rules,
      image,
    } = req.body;

    // Validation
    if (!name || !capacity || !location || pricePerHour === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const room = await Room.create({
      name,
      description,
      capacity,
      location,
      amenities: amenities || [],
      pricePerHour,
      rules: rules || [],
      image,
    });

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      room,
    });
  } catch (error) {
    console.error("Create room error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating room",
      error: error.message,
    });
  }
};

// @route   GET /api/rooms
// @desc    Get all rooms
// @access  Public
exports.getAllRooms = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      capacity,
      location,
      minPrice,
      maxPrice,
    } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = { availability: true };

    if (capacity) {
      query.capacity = { $gte: parseInt(capacity) };
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (minPrice || maxPrice) {
      query.pricePerHour = {};
      if (minPrice) query.pricePerHour.$gte = parseFloat(minPrice);
      if (maxPrice) query.pricePerHour.$lte = parseFloat(maxPrice);
    }

    const rooms = await Room.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Room.countDocuments(query);

    res.status(200).json({
      success: true,
      count: rooms.length,
      total,
      pages: Math.ceil(total / limit),
      page: parseInt(page),
      rooms,
    });
  } catch (error) {
    console.error("Get all rooms error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching rooms",
      error: error.message,
    });
  }
};

// @route   GET /api/rooms/:id
// @desc    Get room by ID
// @access  Public
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    console.error("Get room error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching room",
      error: error.message,
    });
  }
};

// @route   PUT /api/rooms/:id
// @desc    Update room (Admin/Staff only)
// @access  Private
exports.updateRoom = async (req, res) => {
  try {
    const {
      name,
      description,
      capacity,
      location,
      amenities,
      pricePerHour,
      rules,
      image,
      availability,
    } = req.body;

    let room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Update fields
    if (name) room.name = name;
    if (description) room.description = description;
    if (capacity) room.capacity = capacity;
    if (location) room.location = location;
    if (amenities) room.amenities = amenities;
    if (pricePerHour !== undefined) room.pricePerHour = pricePerHour;
    if (rules) room.rules = rules;
    if (image) room.image = image;
    if (availability !== undefined) room.availability = availability;

    await room.save();

    res.status(200).json({
      success: true,
      message: "Room updated successfully",
      room,
    });
  } catch (error) {
    console.error("Update room error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating room",
      error: error.message,
    });
  }
};

// @route   DELETE /api/rooms/:id
// @desc    Delete room (Admin only)
// @access  Private
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    await Room.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    console.error("Delete room error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting room",
      error: error.message,
    });
  }
};
