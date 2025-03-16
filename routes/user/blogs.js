const express = require("express")
const router = express.Router()
const blogsController = require("../../controllers/user/userBlogsController.js")
const passport = require("passport")
const { checkBlogOfComments, validateBlogger, validateBlogCreator, validateCommentCreator } = require("../../middleware.js")
//TODO GET current user's ALL blogs, including unpublished
//GET specfic unpublished blog
router.get("/", passport.authenticate("jwt", { session: false }), blogsController.getCurrentUsersBlogs)
router.get("/:blogId", passport.authenticate("jwt", { session: false }), blogsController.getSpecificBlogFromCurrentUser)
//router.get("/:blogId/comments", checkBlogOfComments, blogsController.getPublishedComments)
//router.get("/:blogId/comments/:commentId", checkBlogOfComments, blogsController.getComment)

router.post("/", passport.authenticate("jwt", { session: false }), validateBlogger, blogsController.createBlog)
router.post("/:blogId/comments", checkBlogOfComments, passport.authenticate("jwt", { session: false }), blogsController.createComment)


router.put("/:blogId", passport.authenticate("jwt", { session: false }), validateBlogger, validateBlogCreator, blogsController.updateBlog)
router.put("/:blogId/comments/:commentId", checkBlogOfComments, passport.authenticate("jwt", { session: false }), validateCommentCreator, blogsController.updateComment)

router.delete("/:blogId", passport.authenticate("jwt", { session: false }), validateBlogger, validateBlogCreator, blogsController.deleteBlog)
router.delete("/:blogId/comments/:commentId", checkBlogOfComments, passport.authenticate("jwt", { session: false }), validateCommentCreator, blogsController.deleteComment)

module.exports = router



