const express = require("express")
const app = express()
const passport = require("passport")
require("./config/passport.js")(passport)
const PORT = process.env.PORT || 3235


const indexRoute = require("./routes/index")
const userRoute = require("./routes/user")
const blogsRoute = require("./routes/blogs")

app.use("/", indexRoute)
app.use("/blogs", blogsRoute)
app.use("/user", userRoute)

app.listen(PORT, ()=>{
  console.log(`App starting on Port: ${PORT}`)
})
