const express = require("express")
const router = express.Router()
//const blogsController = require("../../controllers/public/publicBlogsController.js")
//const passport = require("passport")
//const { checkBlogOfComments, validateBlogger, validateBlogCreator, validateCommentCreator } = require("../../middleware.js")

const blogsRoute = require("./blogs.js")
router.use("/blogs", blogsRoute)

module.exports = router
