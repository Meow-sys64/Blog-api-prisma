const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { body, validationResult } = require('express-validator');
const { genHash, validateHash, issueJWT } = require('../../lib/Utils');

module.exports = {
  register: [
    body("username")
      .notEmpty()
      .escape()
      .withMessage("Error with username format"),
    body("password")
      .notEmpty()
      .withMessage("Password cannot be empty")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long")
      .escape(),

    async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errorArray: errors.array() })
      }
      const { username, password } = req.body

      //check if username exists
      const checkName = await prisma.user.findUnique({
        where: {
          username: username
        }
      })

      if (checkName) {
        return res.status(401).json({ message: "Username already exists", })
      }

      //create account
      const passwordHash = await genHash(password)
      try {
        const user = await prisma.user.create({
          data: {
            username: username,
            password_hash: passwordHash,
            isBlogger: true
          }
        })
        const jwt = issueJWT(user)
        return res.status(200).json({ success: true, token: jwt, id: user.id, username: user.username, isAdmin: user.isAdmin, isBlogger: user.isBlogger })

      }
      catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Server error when creating the account" })
      }


    }],
  login: [
    body("username")
      .notEmpty()
      .escape()
      .withMessage("Error with username format"),
    body("password")
      .notEmpty()
      .withMessage("Password cannot be empty")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long")
      .escape(),

    async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errorArray: errors.array() })
      }
      try {
        //get user
        const { username, password } = req.body
        const user = await prisma.user.findUnique({
          where: {
            username: username
          }
        })
        //Verify user
        if (!user) {
          return res.status(401).json({ success: false, message: "Username does not exist." })
        }

        //Verify password
        const isValid = validateHash(password, user.password_hash)
        if (!isValid) {
          return res.status(401).json({ success: false, message: "Incorrect Password" })
        }

        //issue token
        const jwt = issueJWT(user)
        return res.status(200).json({ success: true, id: user.id, token: jwt, username: user.username, isAdmin: user.isAdmin, isBlogger: user.isBlogger })

      }
      catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Server Error when issuing token" })
      }
    }],
  updateBloggerStatus: [
    body("secretCode")
      .escape(),

    async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errorArray: errors.array() })
      }
      console.log(req.user);

      // validate secretCode
      // update isBlogger status
      try {
        await prisma.user.update({
          where: {
            id: req.user.id
          },
          data: {
            isBlogger: true
          }
        })
        res.status(200).json({ success: true, message: "User given blogger privileges" })
      }
      catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Server Error when updating user' })
      }
    }
  ],
  getTokenStatus: async (req, res, next) => {
    res.status(200).json({ success: true, message: "Token is valid", id: req.user.id, username: req.user.username, isAdmin: req.user.isAdmin, isBlogger: req.user.isBlogger })
  },
  deleteUser: async (req, res, next) => {

  },
}
