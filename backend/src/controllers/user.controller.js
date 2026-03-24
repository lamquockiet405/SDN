const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const UserProfile = require("../models/UserProfile");
const Violation = require("../models/Violation");
const Booking = require("../models/Booking");
const RolePermission = require("../models/RolePermission");
const { getIpAddress, getUserAgent } = require("../utils/helpers");
const {
  syncProfileFromAuthUser,
  ensureProfileByAuthUserId,
} = require("../utils/userProfile");

const ADMIN_FULL_PERMISSIONS = [
  "dashboard:view",
  "users:view",
  "users:edit",
  "users:status",
  "users:role",
  "staff:manage",
  "violations:view",
  "permissions:manage",
  "profile:view",
  "profile:edit",
];

const DEFAULT_ROLE_PERMISSIONS = {
  admin: ADMIN_FULL_PERMISSIONS,
  staff: [
    "dashboard:view",
    "users:view",
    "users:status",
    "violations:view",
    "profile:view",
    "profile:edit",
  ],
  user: ["profile:view", "profile:edit"],
};

const STATUS_TO_ACTIVE = {
  active: true,
  inactive: false,
  locked: false,
};

const NO_SHOW_GRACE_MINUTES = 15;

const toPagination = (query) => {
  const page = Math.max(parseInt(query.page || 1, 10), 1);
  const limit = Math.min(Math.max(parseInt(query.limit || 10, 10), 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const logAudit = async (req, targetUserId, action, metadata = {}) => {
  try {
    await AuditLog.create({
      userId: req.user._id,
      action,
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
      status: "success",
      metadata: {
        targetUserId,
        ...metadata,
      },
    });
  } catch (error) {
    console.error("Audit log error:", error.message);
  }
};

const seedDefaultRolePermissions = async () => {
  const roles = Object.keys(DEFAULT_ROLE_PERMISSIONS);

  await Promise.all(
    roles.map((role) => {
      if (role === "admin") {
        return RolePermission.findOneAndUpdate(
          { role },
          { $set: { permissions: ADMIN_FULL_PERMISSIONS } },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );
      }

      return RolePermission.findOneAndUpdate(
        { role },
        { $setOnInsert: { permissions: DEFAULT_ROLE_PERMISSIONS[role] } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    }),
  );
};

const canAccessProfile = (req, targetAuthUserId) => {
  if (["admin", "staff"].includes(req.user.role)) {
    return true;
  }

  return req.user._id.toString() === targetAuthUserId.toString();
};

const serializeUser = (authUser, profile, violationCount = 0) => ({
  id: authUser._id,
  authUserId: authUser._id,
  name: profile?.name || authUser.name,
  email: profile?.email || authUser.email,
  role: profile?.role || authUser.role,
  status: profile?.status || (authUser.isActive ? "active" : "inactive"),
  phone: profile?.phone || "",
  department: profile?.department || "",
  lastLogin: profile?.lastLogin || authUser.lastLogin,
  createdAt: authUser.createdAt,
  violationCount,
});

const syncNoShowViolations = async () => {
  const cutoffTime = new Date(Date.now() - NO_SHOW_GRACE_MINUTES * 60 * 1000);

  const overdueBookings = await Booking.find({
    status: { $in: ["approved", "confirmed"] },
    startTime: { $lte: cutoffTime },
    $or: [{ checkInTime: { $exists: false } }, { checkInTime: null }],
  })
    .select("_id userId startTime")
    .lean();

  if (overdueBookings.length === 0) {
    return;
  }

  const bookingIds = overdueBookings.map((booking) => booking._id);

  const existingNoShowViolations = await Violation.find({
    violationType: "no_show",
    bookingId: { $in: bookingIds },
  })
    .select("bookingId")
    .lean();

  const existingBookingIdSet = new Set(
    existingNoShowViolations
      .filter((item) => item.bookingId)
      .map((item) => item.bookingId.toString()),
  );

  const violationsToCreate = overdueBookings
    .filter((booking) => !existingBookingIdSet.has(booking._id.toString()))
    .map((booking) => ({
      authUserId: booking.userId,
      reason: `No-show violation: booking started at ${new Date(booking.startTime).toLocaleString()}`,
      severity: "medium",
      status: "active",
      violationType: "no_show",
      bookingId: booking._id,
      createdBy: booking.userId,
    }));

  if (violationsToCreate.length > 0) {
    await Violation.insertMany(violationsToCreate, { ordered: false });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    await seedDefaultRolePermissions();
    await syncNoShowViolations();

    const [
      totalUsers,
      totalStaff,
      totalAdmins,
      activeViolations,
      totalViolations,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "staff" }),
      User.countDocuments({ role: "admin" }),
      Violation.countDocuments({ status: "active" }),
      Violation.countDocuments(),
    ]);

    const [inactiveUsers, lockedUsers] = await Promise.all([
      UserProfile.countDocuments({ status: "inactive" }),
      UserProfile.countDocuments({ status: "locked" }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalStaff,
        totalAdmins,
        activeViolations,
        totalViolations,
        inactiveUsers,
        lockedUsers,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error.message,
    });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    const { page, limit, skip } = toPagination(req.query);

    const query = {};
    if (role) query.role = role;

    if (status) {
      const statusMatchedProfiles = await UserProfile.find({ status }).select(
        "authUserId",
      );
      query._id = {
        $in: statusMatchedProfiles.map((profile) => profile.authUserId),
      };
    }

    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    let authUsers;
    if (Object.keys(query).length || Object.keys(searchQuery).length) {
      authUsers = await User.find({ ...query, ...searchQuery })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    } else {
      authUsers = await User.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    }

    const userIds = authUsers.map((user) => user._id);

    const [profiles, violationCounts] = await Promise.all([
      UserProfile.find({ authUserId: { $in: userIds } }),
      Violation.aggregate([
        { $match: { authUserId: { $in: userIds } } },
        { $group: { _id: "$authUserId", count: { $sum: 1 } } },
      ]),
    ]);

    const profileMap = new Map(
      profiles.map((profile) => [profile.authUserId.toString(), profile]),
    );
    const violationMap = new Map(
      violationCounts.map((item) => [item._id.toString(), item.count]),
    );

    const data = await Promise.all(
      authUsers.map(async (authUser) => {
        const profile =
          profileMap.get(authUser._id.toString()) ||
          (await syncProfileFromAuthUser(authUser));

        return serializeUser(
          authUser,
          profile,
          violationMap.get(authUser._id.toString()) || 0,
        );
      }),
    );

    const total =
      Object.keys(query).length || Object.keys(searchQuery).length
        ? await User.countDocuments({ ...query, ...searchQuery })
        : await User.countDocuments();

    res.status(200).json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to list users",
      error: error.message,
    });
  }
};

exports.listStaff = async (req, res) => {
  req.query.role = "staff";
  return exports.listUsers(req, res);
};

exports.getStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    const authUser = await User.findById(id);

    if (!authUser || authUser.role !== "staff") {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    const profile = await ensureProfileByAuthUserId(authUser._id);

    return res.status(200).json({
      success: true,
      data: serializeUser(authUser, profile),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch staff",
      error: error.message,
    });
  }
};

exports.createStaff = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      phone = "",
      department = "",
      status = "active",
    } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const authUser = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: "staff",
      isActive: STATUS_TO_ACTIVE[status],
    });

    const profile = await syncProfileFromAuthUser(authUser, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: "staff",
      status,
      phone: phone.trim(),
      department: department.trim(),
    });

    await logAudit(req, authUser._id, "STAFF_CREATE", {
      status,
      department: department.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Staff created",
      data: serializeUser(authUser, profile),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create staff",
      error: error.message,
    });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, department, status, password } = req.body;

    const authUser = await User.findById(id).select("+password");
    if (!authUser || authUser.role !== "staff") {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    if (typeof email === "string") {
      const normalizedEmail = email.trim().toLowerCase();
      const duplicated = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: authUser._id },
      });

      if (duplicated) {
        return res.status(409).json({
          success: false,
          message: "Email already exists",
        });
      }

      authUser.email = normalizedEmail;
    }

    if (typeof name === "string") {
      authUser.name = name.trim();
    }

    if (typeof status === "string") {
      authUser.isActive = STATUS_TO_ACTIVE[status];
    }

    if (typeof password === "string" && password.trim()) {
      authUser.password = password;
    }

    await authUser.save();

    const profile = await ensureProfileByAuthUserId(authUser._id);
    if (typeof name === "string") {
      profile.name = name.trim();
    }
    if (typeof email === "string") {
      profile.email = email.trim().toLowerCase();
    }
    if (typeof phone === "string") {
      profile.phone = phone.trim();
    }
    if (typeof department === "string") {
      profile.department = department.trim();
    }
    if (typeof status === "string") {
      profile.status = status;
    }
    profile.role = "staff";
    await profile.save();

    await logAudit(req, authUser._id, "STAFF_UPDATE", {
      changedFields: Object.keys(req.body || {}),
    });

    return res.status(200).json({
      success: true,
      message: "Staff updated",
      data: serializeUser(authUser, profile),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update staff",
      error: error.message,
    });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const authUser = await User.findById(id);
    if (!authUser || authUser.role !== "staff") {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    await UserProfile.deleteOne({ authUserId: authUser._id });
    await User.deleteOne({ _id: authUser._id });

    await logAudit(req, authUser._id, "STAFF_DELETE", {
      deletedEmail: authUser.email,
    });

    return res.status(200).json({
      success: true,
      message: "Staff deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete staff",
      error: error.message,
    });
  }
};

exports.getViolatedUsers = async (req, res) => {
  try {
    await syncNoShowViolations();

    const { severity, status = "active", search } = req.query;
    const { page, limit, skip } = toPagination(req.query);

    const violationMatch = {};
    if (severity) violationMatch.severity = severity;
    if (status) violationMatch.status = status;

    const aggregated = await Violation.aggregate([
      { $match: violationMatch },
      {
        $group: {
          _id: "$authUserId",
          violationCount: { $sum: 1 },
          lastViolationAt: { $max: "$createdAt" },
          latestReason: { $last: "$reason" },
          highestSeverity: {
            $max: {
              $switch: {
                branches: [
                  { case: { $eq: ["$severity", "low"] }, then: 1 },
                  { case: { $eq: ["$severity", "medium"] }, then: 2 },
                  { case: { $eq: ["$severity", "high"] }, then: 3 },
                ],
                default: 1,
              },
            },
          },
        },
      },
      { $sort: { lastViolationAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const authUserIds = aggregated.map((item) => item._id);

    const [authUsers, profiles, totalCount] = await Promise.all([
      User.find({ _id: { $in: authUserIds } }),
      UserProfile.find({ authUserId: { $in: authUserIds } }),
      Violation.aggregate([
        { $match: violationMatch },
        { $group: { _id: "$authUserId" } },
        { $count: "total" },
      ]),
    ]);

    const userMap = new Map(
      authUsers.map((user) => [user._id.toString(), user]),
    );
    const profileMap = new Map(
      profiles.map((profile) => [profile.authUserId.toString(), profile]),
    );

    let data = aggregated
      .map((item) => {
        const authUser = userMap.get(item._id.toString());
        if (!authUser) return null;

        const profile = profileMap.get(item._id.toString());
        const severityLabel =
          item.highestSeverity === 3
            ? "high"
            : item.highestSeverity === 2
              ? "medium"
              : "low";

        return {
          id: item._id,
          name: profile?.name || authUser.name,
          email: profile?.email || authUser.email,
          role: profile?.role || authUser.role,
          status:
            profile?.status || (authUser.isActive ? "active" : "inactive"),
          violationCount: item.violationCount,
          lastViolationAt: item.lastViolationAt,
          latestReason: item.latestReason,
          severity: severityLabel,
        };
      })
      .filter(Boolean);

    if (search) {
      const searchLower = search.toLowerCase();
      data = data.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.email.toLowerCase().includes(searchLower),
      );
    }

    const total = totalCount[0]?.total || 0;

    res.status(200).json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to list violated users",
      error: error.message,
    });
  }
};

exports.createViolation = async (req, res) => {
  try {
    const { userId, reason, severity = "low" } = req.body;

    const authUser = await User.findById(userId);
    if (!authUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await ensureProfileByAuthUserId(authUser._id);

    const violation = await Violation.create({
      authUserId: authUser._id,
      reason,
      severity,
      status: "active",
      createdBy: req.user._id,
    });

    await logAudit(req, authUser._id, "VIOLATION_CREATE", {
      violationId: violation._id,
      severity,
    });

    res.status(201).json({
      success: true,
      message: "Violation created",
      data: violation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create violation",
      error: error.message,
    });
  }
};

exports.getPermissions = async (req, res) => {
  try {
    await seedDefaultRolePermissions();

    const permissions = await RolePermission.find().sort({ role: 1 });

    res.status(200).json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load permissions",
      error: error.message,
    });
  }
};

exports.updateRolePermissions = async (req, res) => {
  try {
    const { role } = req.params;
    const { permissions } = req.body;

    const normalizedPermissions =
      role === "admin" ? ADMIN_FULL_PERMISSIONS : permissions;

    const rolePermission = await RolePermission.findOneAndUpdate(
      { role },
      {
        $set: {
          permissions: normalizedPermissions,
          updatedBy: req.user._id,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    await logAudit(req, req.user._id, "PERMISSIONS_UPDATE", {
      role,
      permissionsCount: normalizedPermissions.length,
    });

    res.status(200).json({
      success: true,
      message: "Permissions updated",
      data: rolePermission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update permissions",
      error: error.message,
    });
  }
};

exports.assignRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (role !== "user") {
      return res.status(400).json({
        success: false,
        message:
          "Only role 'user' can be assigned here. Use staff management endpoint for staff accounts.",
      });
    }

    const authUser = await User.findById(id);

    if (!authUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const previousRole = authUser.role;
    authUser.role = role;
    await authUser.save();

    const profile = await syncProfileFromAuthUser(authUser, { role });

    await logAudit(req, authUser._id, "ROLE_CHANGE", {
      previousRole,
      newRole: role,
    });

    res.status(200).json({
      success: true,
      message: "Role updated",
      data: serializeUser(authUser, profile),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to assign role",
      error: error.message,
    });
  }
};

exports.changeUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const authUser = await User.findById(id);
    if (!authUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const profile =
      (await UserProfile.findOne({ authUserId: authUser._id })) ||
      (await syncProfileFromAuthUser(authUser));

    const previousStatus = profile.status;

    profile.status = status;
    await profile.save();

    authUser.isActive = STATUS_TO_ACTIVE[status];
    await authUser.save();

    await logAudit(req, authUser._id, "STATUS_CHANGE", {
      previousStatus,
      newStatus: status,
    });

    res.status(200).json({
      success: true,
      message: "User status updated",
      data: serializeUser(authUser, profile),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update user status",
      error: error.message,
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const authUser = await User.findById(id);

    if (!authUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!canAccessProfile(req, authUser._id)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const profile = await ensureProfileByAuthUserId(authUser._id);

    res.status(200).json({
      success: true,
      data: serializeUser(authUser, profile),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

exports.getMyProfile = async (req, res) => {
  req.params.id = req.user._id;
  return exports.getProfile(req, res);
};

exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, department } = req.body;

    const authUser = await User.findById(id);
    if (!authUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!canAccessProfile(req, authUser._id)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const profile = await ensureProfileByAuthUserId(authUser._id);

    const updates = {};
    if (typeof name === "string") {
      updates.name = name.trim();
      authUser.name = name.trim();
      await authUser.save();
    }

    if (typeof phone === "string") {
      updates.phone = phone.trim();
    }

    if (typeof department === "string") {
      updates.department = department.trim();
    }

    const updatedProfile = await UserProfile.findOneAndUpdate(
      { authUserId: authUser._id },
      { $set: updates },
      { new: true, runValidators: true },
    );

    await logAudit(req, authUser._id, "PROFILE_UPDATE", {
      changedFields: Object.keys(updates),
    });

    res.status(200).json({
      success: true,
      message: "Profile updated",
      data: serializeUser(authUser, updatedProfile || profile),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

exports.updateMyProfile = async (req, res) => {
  req.params.id = req.user._id;
  return exports.updateProfile(req, res);
};
