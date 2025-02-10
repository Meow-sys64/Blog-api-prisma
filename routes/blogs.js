const express = require("express")
const router  = express.Router()
const blogsController = require("../controllers/blogsController")

router.get("/", blogsController.getBlogs )
router.get("/:blogId", blogsController.getBlog )
router.get("/:blogId/comments", blogsController.getComments )
router.get("/:blogId/comments/:commentId", blogsController.getComment )

router.post("/", blogsController.createBlog)
router.post("/blogs/:blogId/Comments", blogsController.createComment)

router.put("/:blogId", blogsController.updateBlog)
router.put("/:blogId/comments/:commentId", blogsController.updateComment)

router.delete("/:blogId", blogsController.deleteBlog)
router.delete("/:blogId/comments/:commentId", blogsController.deleteComment)

module.exports = router

