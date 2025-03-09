const express = require("express")
const router = express.Router()
const accountController = require("../../controllers/user/accountController")
const passport = require("passport")

router.use((req,res,next)=>{
  console.log(req)
  next()
})
router.get("/token-status", passport.authenticate("jwt",{session:false}), accountController.getTokenStatus)

router.post("/register", accountController.register)
router.post("/login", accountController.login)

router.put("/bloggerStatus", passport.authenticate("jwt", { session: false }), accountController.updateBloggerStatus)

router.delete("/", accountController.deleteUser)

module.exports = router
