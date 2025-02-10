const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { body, validationResult } = require('express-validator')

module.exports = {
  register: [ 
    body("username")
      .notEmpty(),
      .escape(),
      .withMessage()
    async (req,res,next)=>{

  } ],
  login: async (req,res,next)=>{

  },
  deleteUser: async (req,res,next)=>{

  },
}
