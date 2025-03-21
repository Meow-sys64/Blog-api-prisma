const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient().$extends({
  query: {
    blogPost: {
      $allOperations({ model, operation, args, query }) {
        //filter create and delete operations
        const createAndDeleteOperations = ["create", "createMany", "createManyAndReturn", "delete", "deleteMany", "deleteManyAndReturn"]
        if (createAndDeleteOperations.includes(operation)) {
          return query(args)
        }

        args.where = { ...args.where, isDeleted: false }

        return query(args)
      }
    },
    comment: {
      $allOperations({ model, operation, args, query }) {
        //filter create and delete operations
        const createOperations = ["create", "createMany", "createManyAndReturn"]
        if (createOperations.includes(operation)) {
          return query(args)
        }

        args.where = { ...args.where, isDeleted: false }

        return query(args)
      }
    }

  }
})
const { body, validationResult } = require('express-validator');

module.exports = {
  getSpecificBlogFromCurrentUser: async (req, res, next) => {
    try {
      const blog = await prisma.blogPost.findUnique({
        include: {
          user: {
            select: {
              username: true,
              isBlogger: true
            }
          }
        },
        omit: {
          isDeleted: true
        },
        where: {
          id: parseInt(req.params.blogId)
        }
      })
      if (blog.userId !== req.user.id) {
        return res.status(403).json({ message: "User does not own Blog!" })
      }
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" })
      }
      res.status(200).json({ success: true, blog })

    } catch (err) {
      console.error(err)
      res.status(500).json({ success: false, message: "Server Error while getting current user's blogs" })

    }
  },
  getCurrentUsersBlogs: async (req, res, next) => {
    try {
      const blogs = await prisma.blogPost.findMany({
        //include: {
        //  user: {
        //    select: {
        //      username: true,
        //      isBlogger: true
        //    }
        //  }
        //},
        omit: {
          isDeleted: true
        },
        where: { userId: parseInt(req.user.id) }
      })
      res.status(200).json({ success: true, blogs })

    } catch (err) {
      console.error(err)
      res.status(500).json({ success: false, message: "Server Error while getting current user's blogs" })

    }
  },
  createBlog: [
    body("title")
      .notEmpty()
      .withMessage("Title cannot be empty.")
      .escape(),
    body("content")
      .notEmpty()
      .withMessage("Content cannot be empty")
      .escape(),
    body("isPublished")
      .isBoolean()
      .withMessage("isPublished must be a boolean"),

    async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errorArray: errors.array() })
      }

      //create blog
      const { title, content } = req.body
      try {
        await prisma.blogPost.create({
          data: {
            title: title,
            content: content,
            user: { connect: { id: req.user.id } },
            isPublished: req.body.isPublished || false
          }
        })

        return res.status(200).json({ success: true, message: "Blog created" })
      }
      catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Server Error when creating blog post" })
      }
    }],
  createComment: [
    body("content")
      .notEmpty()
      .withMessage("Comment cannot be empty")
      .escape(),

    async (req, res, next) => {
      //Check errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errorArray: errors.array() })
      }

      // create Comment
      try {
        await prisma.comment.create({
          data: {
            user: { connect: { id: parseInt(req.user.id) } },
            content: req.body.content,
            blogPost: { connect: { id: parseInt(req.params.blogId) } }
          }
        })

        res.status(200).json({
          success: true,
          message: "Comment created"
        })
      }
      catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: "Server Error creating comment" })
      }
    }],
  updateBlog: [
    body("title")
      .escape(),
    body("content")
      .escape(),
    body("isPublished")
      .isBoolean()
      .withMessage("isPublished must be a boolean"),

    async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errorArray: errors.array() })
      }

      //update blog
      let updatedData = { isEdited: true }
      if (req.body.title) updatedData.title = req.body.title;
      if (req.body.content) updatedData.content = req.body.content;
      if (req.body.isPublished !== undefined) updatedData.isPublished = req.body.isPublished;

      try {
        await prisma.$transaction([
          //create blog history
          prisma.blogPostHistory.create({
            data: {
              title: req.blogData.title,
              content: req.blogData.content,
              isPublished: req.blogData.isPublished,
              user: { connect: { id: req.blogData.userId } },
              previousUpdatedAt: req.blogData.updatedAt,
              blogPost: { connect: { id: parseInt(req.blogData.id) } }
            }
          }),
          //update blog
          prisma.blogPost.update({
            where: { id: parseInt(req.params.blogId) },
            data: updatedData
          })

        ])
        return res.status(200).json({ success: true, message: "Blog updated" })
      }
      catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Server Error when updating blog post" })
      }
    }],
  updateComment: [
    body("content")
      .escape(),

    async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errorArray: errors.array() })
      }

      try {
        await prisma.$transaction([
          //create comment history
          prisma.commentHistory.create({
            data: {
              user: { connect: { id: parseInt(req.commentData.userId) } },
              content: req.commentData.content,
              blogPost: { connect: { id: parseInt(req.commentData.blogPostId) } },
              comment: { connect: { id: req.commentData.id } }
            }
          }),
          //update comment
          prisma.comment.update({
            where: { id: parseInt(req.params.commentId) },
            data: {
              content: req.body.content,
              isEdited: true
            }
          })

        ])
        return res.status(200).json({ success: true, message: "Comment updated" })
      }
      catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Server Error when updating comment" })
      }
    }],
  deleteBlog: async (req, res, next) => {
    try {
      await prisma.blogPost.update({
        where: { id: parseInt(req.params.blogId) },
        data: {
          isDeleted: true
        }
      })
      res.status(200).json({ success: true, message: "Blog deleted" })
    }
    catch (err) {
      console.error(err)
      return res.status(500).json({ success: false, message: "Server Error when deleteing blog" })
    }

  },
  deleteComment: async (req, res, next) => {
    try {
      //update comment for soft delete
      await prisma.comment.update({
        where: { id: parseInt(req.params.commentId) },
        data: {
          isDeleted: true
        }
      })

      return res.status(200).json({ success: true, message: "Comment deleted" })
    }
    catch (err) {
      console.error(err)
      return res.status(500).json({ success: false, message: "Server Error when deleting comment" })
    }


  },
}

