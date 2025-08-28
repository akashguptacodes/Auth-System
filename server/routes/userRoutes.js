const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");


const { auth, isAdmin } = require("../middlewares/auth");

router.get("/", auth,isAdmin,userController.getAllUsers);
router.put("/:id",auth, userController.updateUser);
router.delete("/delete/:id",auth,isAdmin, userController.deleteUser);
router.get("/getbyid/:id",auth, userController.getUserById);
router.get("/getbyemail/:email",auth, userController.getUserByEmail);

module.exports = router;