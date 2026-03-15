const AuditLog = require("../models/AuditLog");

// @route   GET /api/audit-logs
// @desc    Get all audit logs (Admin/Staff only)
// @access  Private
exports.getAllAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("userId", "name email");

    const total = await AuditLog.countDocuments();

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      pages: Math.ceil(total / limit),
      page: parseInt(page),
      logs,
    });
  } catch (error) {
    console.error("Get audit logs error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching audit logs",
      error: error.message,
    });
  }
};

// @route   GET /api/audit-logs/search
// @desc    Search audit logs with filters
// @access  Private
exports.searchAuditLogs = async (req, res) => {
  try {
    const {
      userId,
      action,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    if (userId) {
      query.userId = userId;
    }

    if (action) {
      query.action = action;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(
          new Date(endDate).getTime() + 24 * 60 * 60 * 1000,
        ); // Include entire day
      }
    }

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("userId", "name email");

    const total = await AuditLog.countDocuments(query);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      pages: Math.ceil(total / limit),
      page: parseInt(page),
      logs,
    });
  } catch (error) {
    console.error("Search audit logs error:", error);
    res.status(500).json({
      success: false,
      message: "Error searching audit logs",
      error: error.message,
    });
  }
};

// @route   GET /api/audit-logs/:id
// @desc    Get specific audit log
// @access  Private
exports.getAuditLogById = async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id).populate(
      "userId",
      "name email",
    );

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Audit log not found",
      });
    }

    res.status(200).json({
      success: true,
      log,
    });
  } catch (error) {
    console.error("Get audit log error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching audit log",
      error: error.message,
    });
  }
};

// @route   DELETE /api/audit-logs/:id
// @desc    Delete audit log (Admin only)
// @access  Private
exports.deleteAuditLog = async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id);

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Audit log not found",
      });
    }

    await AuditLog.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: "Audit log deleted successfully",
    });
  } catch (error) {
    console.error("Delete audit log error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting audit log",
      error: error.message,
    });
  }
};
