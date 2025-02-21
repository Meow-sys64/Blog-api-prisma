const express = require("express")
const router = express.Router()
const blogsController = require("../../controllers/public/publicBlogsController.js")
const passport = require("passport")
const { checkBlogOfComments, validateBlogger, validateBlogCreator, validateCommentCreator } = require("../../middleware.js")

router.get("/", blogsController.getPublishedBlogs)
router.get("/:blogId", blogsController.getBlog)
router.get("/:blogId/comments", checkBlogOfComments, blogsController.getPublishedComments)
router.get("/:blogId/comments/:commentId", checkBlogOfComments, blogsController.getComment)

//router.post("/", passport.authenticate("jwt", { session: false }), validateBlogger, blogsController.createBlog)
//router.post("/:blogId/comments", checkBlogOfComments, passport.authenticate("jwt", { session: false }), blogsController.createComment)
//
//
//router.put("/:blogId", passport.authenticate("jwt", { session: false }), validateBlogger, validateBlogCreator, blogsController.updateBlog)
//router.put("/:blogId/comments/:commentId", checkBlogOfComments, passport.authenticate("jwt", { session: false }), validateCommentCreator, blogsController.updateComment)
//
//router.delete("/:blogId", passport.authenticate("jwt", { session: false }), validateBlogger, validateBlogCreator, blogsController.deleteBlog)
//router.delete("/:blogId/comments/:commentId", checkBlogOfComments, passport.authenticate("jwt", { session: false }), validateCommentCreator, blogsController.deleteComment)

module.exports = router


