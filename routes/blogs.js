const express = require("express")
const router = express.Router()
const blogsController = require("../controllers/blogsController")
const passport = require("passport")
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

router.get("/", blogsController.getPublishedBlogs)
router.get("/:blogId", blogsController.getBlog)
router.get("/:blogId/comments", blogsController.getPublishedComments)
router.get("/:blogId/comments/:commentId", blogsController.getComment)

router.post("/", passport.authenticate("jwt", { session: false }), validateBlogger, blogsController.createBlog)
router.post("/:blogId/comments", passport.authenticate("jwt", { session: false }), blogsController.createComment)


router.put("/:blogId", passport.authenticate("jwt", { session: false }), validateBlogger, validateBlogCreator, blogsController.updateBlog)
router.put("/:blogId/comments/:commentId", passport.authenticate("jwt", { session: false }), blogsController.updateComment)

router.delete("/:blogId", passport.authenticate("jwt", { session: false }), validateBlogger, validateBlogCreator, blogsController.deleteBlog)
router.delete("/:blogId/comments/:commentId", passport.authenticate("jwt", { session: false }), blogsController.deleteComment)

module.exports = router

function validateBlogger(req, res, next) {
  try {
    if (!(req.user.isBlogger)) {
      return res.status(403).json({ message: "Forbidden. User not Blogger" })
    }
    else {
      next()
    }
  }
  catch (err) {
    return res.status(500).json({ message: "Server side Error." })
  }
}

function validateBlogCreator(req, res, next) {
  prisma.blogPost.findUnique({
    where: { id: parseInt(req.params.blogId) }
  })
  .then(blog => {
    if (!blog) {
      return res.status(400).json({ success: false, message: "Blog does not exist" });
    }

    if (blog.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: "User does not own Blog" });
    }

    next();
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error when trying to validate blog owner" });
  });
}

