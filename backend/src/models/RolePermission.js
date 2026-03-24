const mongoose = require("mongoose");
const { getUserConnection } = require("../config/db");

const rolePermissionSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "staff", "admin"],
      required: true,
      unique: true,
      index: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true },
);

const userConnection = getUserConnection();

module.exports =
  userConnection.models.RolePermission ||
  userConnection.model("RolePermission", rolePermissionSchema);
