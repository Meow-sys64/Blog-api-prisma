require('dotenv').config()
var JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt;
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const fs = require("fs");
const path = require("path");
const pathToPubKey = path.join(__dirname, "..", "/keypairs", "id_rsa_pub.pem");
const PUB_KEY = fs.readFileSync(pathToPubKey, "utf8");

var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = PUB_KEY
//opts.issuer = 'accounts.examplesoft.com';
//opts.audience = 'yoursite.net';
opts.algorithms = ['RS256']

const strategy = new JwtStrategy(opts, function(jwt_payload, done) {
  prisma.user.findUnique({ id: jwt_payload.sub })
    .then((user) => {
      if (user) {
        return done(null, user)
      } else {
        return done(null, false)
      }
    })
    .catch(err => done(err, false))
})

module.exports = (passport) =>{   
  passport.use(strategy) 
}



