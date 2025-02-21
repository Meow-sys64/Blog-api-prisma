const express = require("express")
const router = express.Router()
const blogsController = require("../../controllers/public/publicBlogsController.js")
//const passport = require("passport")
const { checkBlogOfComments, validateBlogger, validateBlogCreator, validateCommentCreator } = require("../../middleware.js")

router.get("/", blogsController.getPublishedBlogs)
router.get("/:blogId", blogsController.getBlog)
router.get("/:blogId/comments", checkBlogOfComments, blogsController.getPublishedComments)
router.get("/:blogId/comments/:commentId", checkBlogOfComments, blogsController.getComment)

module.exports = router


