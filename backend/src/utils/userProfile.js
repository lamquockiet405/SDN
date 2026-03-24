const User = require("../models/User");
const UserProfile = require("../models/UserProfile");

const normalizeStatusFromAuthUser = (authUser) => {
  if (authUser.isActive === false) {
    return "inactive";
  }

  return "active";
};

const syncProfileFromAuthUser = async (authUser, overrides = {}) => {
  if (!authUser) {
    return null;
  }

  const payload = {
    authUserId: authUser._id,
    name: authUser.name,
    email: authUser.email,
    role: authUser.role,
    status: normalizeStatusFromAuthUser(authUser),
    lastLogin: authUser.lastLogin,
    ...overrides,
  };

  return UserProfile.findOneAndUpdate(
    { authUserId: authUser._id },
    { $set: payload },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );
};

const ensureProfileByAuthUserId = async (authUserId) => {
  const profile = await UserProfile.findOne({ authUserId });
  if (profile) {
    return profile;
  }

  const authUser = await User.findById(authUserId);
  if (!authUser) {
    return null;
  }

  return syncProfileFromAuthUser(authUser);
};

module.exports = {
  syncProfileFromAuthUser,
  ensureProfileByAuthUserId,
};
