const express = require("express");
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  bulkCreateUsers,
} = require("../controllers/user.controller");

router.post("/", createUser);
router.post("/bulk", bulkCreateUsers);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
