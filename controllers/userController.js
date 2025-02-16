const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { body, validationResult } = require('express-validator');
const { genHash, validateHash, issueJWT } = require('../lib/Utils');

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
        res.status(400).json({ message: "Username already exists", })
      }

      //create account
      const passwordHash = await genHash(password)
      try {
        const user = await prisma.user.create({
          data: {
            username: username,
            password_hash: passwordHash
          }
        })
        const jwt = issueJWT(user)
        return res.status(200).json({ success: true, token: jwt })

      }
      catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Server error when creating the account" })
      }


    }],

  },
}
