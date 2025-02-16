const express = require("express")
const router  = express.Router()
const userController = require("../controllers/userController")
const passport = require("passport")

router.post("/register", userController.register )
router.post("/login", userController.login )

router.put("/bloggerStatus", passport.authenticate("jwt",{session:false}),  userController.updateBloggerStatus)

router.delete("/", userController.deleteUser)

module.exports = router
