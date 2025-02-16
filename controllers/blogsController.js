const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
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
          }
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
  getComments: async (req, res, next) => {

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
  createComment: async (req, res, next) => {

  },
  updateBlog: async (req, res, next) => {

  },
  updateComment: async (req, res, next) => {

  },
  deleteBlog: async (req, res, next) => {

  },
  deleteComment: async (req, res, next) => {

  },
}

