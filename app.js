const express = require("express")
const app = express()
const passport = require("passport")
require("./config/passport.js")(passport)
const PORT = process.env.PORT || 3235
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//const indexRoute = require("./routes/index")
//const userRoute = require("./routes/user")
//const blogsRoute = require("./routes/blogs")
//
//app.use("/", indexRoute)
//app.use("/blogs", blogsRoute)
//Full routes: /( public || user || admin)/blogs/:blogId/comments/:commentId
//user/login
//user/register
const publicRoute = require("./routes/public/index.js")
const userRoute = require("./routes/user/index.js")
const adminRoute = require("./routes/admin/index.js")

app.use("/public", publicRoute)
app.use("/user", userRoute)
app.use("/admin", adminRoute)

app.all("/*", (req, res, next) => {
  //console.error(err)
  return res.status(404).json({ success: false, message: "Resource Not Found" })
})

app.listen(PORT, () => {
  console.log(`App starting on Port: ${PORT}`)
})
