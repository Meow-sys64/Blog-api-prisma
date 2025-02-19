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

        args.where = { ...args.where, isDeleted: false, isPublished: true }

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
  getPublishedBlogs: async (req, res, next) => {
    try {
      const blogs = await prisma.blogPost.findMany({
        include: {
          user: {
            select: {
              username: true,
              isBlogger: true,
              //password_hash:false,
            }
          },
        },
        omit: {
          isPublished: true,
          isDeleted: true
        },
        where: { isPublished: true }
      })
      res.status(200).json({ success: true, blogs })
    }
    catch (err) {
      console.error(err)
      res.status(500).json({ success: false, message: 'Server Error when getting blogs' })
    }
  },
  getBlog: async (req, res, next) => {
    try {
      const blog = await prisma.blogPost.findUnique({
        include: {
          user: {
            select: {
              username: true,
              isBlogger: true,
              //password_hash:false,
            }
          }
        },
        omit: {
          isPublished: true,
          isDeleted: true
        },
        where: {
          isPublished: true,
          id: parseInt(req.params.blogId)
        }
      })
      if (!blog) {
        res.status(400).json({ success: false, message: "Blog not found" })
      }
      res.status(200).json({ success: true, blog })
    }
    catch (err) {
      console.error(err)
      res.status(500).json({ success: false, message: 'Server Error when getting blogs' })
    }

  },
  getPublishedComments: async (req, res, next) => {
    try {
      const comments = await prisma.comment.findMany({
        include: {
          user: {
            select: {
              username: true
            }
          },
        },
        where: {
          //blogPostId: parseInt(req.params.blogId),
          blogPost: {
            id: parseInt(req.params.blogId),
            isPublished: true
          }
        }
      })
      res.status(200).json({
        success: true,
        message: "Successfully got comments",
        comments
      })
    }
    catch (err) {
      console.error(err)
      res.status(500).json({
        success: false,
        message: "Server error when getting comments"
      })
    }

  },
  getComment: async (req, res, next) => {

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
      let updatedData = {}
      if (req.body.title) updatedData.title = req.body.title;
      if (req.body.content) updatedData.content = req.body.content;
      if (req.body.isPublished !== undefined) updatedData.isPublished = req.body.isPublished;

      try {
        await prisma.blogPost.update({
          where: { id: parseInt(req.params.blogId) },
          data: updatedData
        })
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
              comment: {connect:{id:req.commentData.id}}
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

  },
  deleteComment: async (req, res, next) => {

  },
}

