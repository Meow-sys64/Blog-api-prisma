const express = require("express")
const router = express.Router()
//const blogsController = require("../../controllers/user/publicBlogsController.js")
//const passport = require("passport")
//const { checkBlogOfComments, validateBlogger, validateBlogCreator, validateCommentCreator } = require("../../middleware.js")

const blogsRoute = require("./blogs.js")
const accountRoute = require("./account.js")

router.use("/blogs", blogsRoute)
router.use("/account", accountRoute)

module.exports = router



