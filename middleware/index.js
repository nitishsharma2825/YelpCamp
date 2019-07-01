var middlewareobj = {};
var Campground = require("../models/campground");
var Comment = require("../models/comment");
middlewareobj.checkOwnership = function(req,res,next){
    if(req.isAuthenticated())
    {
        Campground.findById(req.params.id,function(err,foundCamp){
            if(err)
            {   req.flash("error","Campground not found!!!");
                console.log(err);}
            else
            {   if(foundCamp.author.id.equals(req.user._id))
                {
                    next();} 
                else
                {
                    req.flash("error","You are not permitted to do that!!");
                    res.redirect("back");
                }
            }
        });
    }
     else {
        req.flash("error","You need to be logged in!!!");
        res.redirect("back");
    }

};
middlewareobj.checkCommentOwnership = function(req,res,next){
    if(req.isAuthenticated())
    {
        Comment.findById(req.params.comment_id,function(err,foundComment){
            if(err)
            {   req.flash("error","Not found!!!");
                console.log(err);}
            else
            {
                 if(foundComment.author.id.equals(req.user._id))
                {
                    next();} 
                else
                {req.flash("error","You are not permitted!!!");
                    res.redirect("back");
                }
            }
        });
    }
     else {
         req.flash("error","You need to be logged in.");
        res.redirect("back");
    }

};

middlewareobj.isLoggedIn = function(req,res,next){
    if(req.isAuthenticated())
    {
        return next();
    }
    req.flash("error","You need to be logged in!!!");
    
    res.redirect("/login");
    }

module.exports = middlewareobj;