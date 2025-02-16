const express = require("express")
const router  = express.Router()
const blogsController = require("../controllers/blogsController")
const passport = require("passport")

router.get("/", blogsController.getBlogs )
router.get("/:blogId", blogsController.getBlog )
router.get("/:blogId/comments", blogsController.getComments )
router.get("/:blogId/comments/:commentId", blogsController.getComment )

router.post("/", passport.authenticate("jwt", {session:false}), validateBlogger, blogsController.createBlog)
router.post("/blogs/:blogId/Comments", passport.authenticate("jwt", {session:false}), blogsController.createComment)

router.put("/:blogId", passport.authenticate("jwt", {session:false}), validateBlogger, blogsController.updateBlog)
router.put("/:blogId/comments/:commentId", passport.authenticate("jwt", {session:false}), blogsController.updateComment)

router.delete("/:blogId", passport.authenticate("jwt", {session:false}), validateBlogger, blogsController.deleteBlog)
router.delete("/:blogId/comments/:commentId", passport.authenticate("jwt", {session:false}), blogsController.deleteComment)

module.exports = router

function validateBlogger(req,res,next){
    try{
        if(!(req.user.isBlogger)){
            return res.status(403).json({message:"Forbidden. User not Blogger"})
        }
        else{
            next()
        }
    }
    catch(err){
        return res.status(500).json({message:"Server side Error."})
    }
}

