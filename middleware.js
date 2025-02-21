const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = {
  validateBlogger(req, res, next) {
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
  },

  validateBlogCreator(req, res, next) {
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
        req.blogData = blog
        next();
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error when trying to validate blog owner" });
      });
  },

  validateCommentCreator(req, res, next) {
    prisma.comment.findUnique({
      where: { id: parseInt(req.params.commentId) }
    })
      .then(comment => {
        if (!comment) {
          return res.status(400).json({ success: false, message: "Comment does not exist" });
        }

        if (comment.userId !== req.user.id) {
          return res.status(403).json({ success: false, message: "User does not own Comment" });
        }
        req.commentData = comment

        next();
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error when trying to validate comment owner" });
      });
  },

  async checkBlogOfComments(req, res, next) {
    //check blogPost for isPublished:true and isDeleted:false
    const blogPost = await prisma.blogPost.findUnique({
      where: { id: parseInt(req.params.blogId) }
    })
    if (!blogPost || blogPost.isPublished === false || blogPost.isDeleted === true) {
      return res.status(400).json({ success: false, message: "Target Blog Post of comment is not found" })
    }
    next()

  },

}
