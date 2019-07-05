var express = require("express");
var passport = require("passport");
var LocalStrategy = require("passport-local"); 
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var methodOverride = require("method-override");
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var User = require("./models/user");
var middlewareObj = require("./middleware");
var seedDB = require("./seeds");
var app = express();


//mongoose.connect("mongodb://localhost/yelp_camp");
mongoose.connect("mongodb+srv://nitish:sharma@cluster0-raugf.mongodb.net/test?retryWrites=true&w=majority");

app.use(bodyParser.urlencoded({extended:true}));

app.set("view engine","ejs");
app.use(express.static(__dirname+"/public"));
//seedDB();
app.use(flash());
var port=process.env.PORT||3000;
app.use(require("express-session")({
    secret:"This is a secret message",
    resave:false,
    saveUninitialized:false
}));


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req,res,next){
    res.locals.currentUser=req.user;
    res.locals.success = req.flash("success");
    res.locals.error= req.flash("error");
    next();
    });
app.use(methodOverride("_method"));
app.get("/",function(req,res){
        res.render("landing");
    });

app.post("/campgrounds",middlewareObj.isLoggedIn,function(req,res){
        var name=req.body.name;
        var image=req.body.image;
        var price = req.body.price;
        var desc=req.body.description;
        var author ={
            id:req.user.id,
            username:req.user.username
        };
        var newCampground = {name:name,price:price,image:image,description:desc,author:author};
        Campground.create(newCampground,function(err){
            if(err)
            {
            console.log(err);  
            }
            else
            {req.flash("success","Successfully created campground!!!");
                res.redirect("/campgrounds");
            }
        });
    });
app.get("/campgrounds",function(req,res){
        Campground.find({},function(err,campgrounds){
            if(err)
            {
                console.log(err);
            }
            else
            {
                res.render("campgrounds/index",{campground:campgrounds});
            }
        });
    });
app.get("/campgrounds/new",middlewareObj.isLoggedIn,function(req,res){
        res.render("campgrounds/new");
    });
    
app.get("/campgrounds/:id",function(req,res){
    Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
        if(err)
        {
            console.log(err);
        }
        else
        {
            res.render("campgrounds/show",{campground:foundCampground});
        }
    });
    });

app.get("/campgrounds/:id/edit",middlewareObj.checkOwnership,function(req,res){
        Campground.findById(req.params.id,function(err,foundCamp){
             res.render("campgrounds/edit",{campground:foundCamp});
        });
    });
app.put("/campgrounds/:id",middlewareObj.checkOwnership,function(req,res){
 Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,newCamp){
    if(err)
        {req.flash("error","Something went wrong!!");
            console.log(err);}
    else
    {
    req.flash("success","Successfully edited campground!!!");
    res.redirect("/campgrounds/"+ req.params.id);
    }
 });
});

app.delete("/campgrounds/:id",middlewareObj.checkOwnership,function(req,res){
    Campground.findByIdAndDelete(req.params.id,function(err){
      req.flash("success","Successfully deleted campground!!!");
        res.redirect("/campgrounds");
    });
});

    
app.get("/campgrounds/:id/comments/new",middlewareObj.isLoggedIn,function(req,res){
        Campground.findById(req.params.id,function(err,campground){
        if(err)
            {   req.flash("Something went wrong!!!");
                console.log(err);}
        else
        {
            res.render("comments/new",{campground:campground});
        }
        });
    });
    
app.post("/campgrounds/:id/comments",middlewareObj.isLoggedIn,function(req,res){
    Campground.findById(req.params.id,function(err,campground){
        if(err)
        {console.log(err);}
        else
        {
            Comment.create(req.body.comment,function(err,comment){
                comment.author.id = req.user.id;
                comment.author.username = req.user.username;
                comment.save();
                campground.comments.push(comment);
                campground.save();
                req.flash("success","Successfully created comment!!!");
                res.redirect("/campgrounds/"+ campground._id);
            });
        }
    });
    });
app.get("/campgrounds/:id/comments/:comment_id/edit",middlewareObj.checkCommentOwnership,function(req,res){
    Comment.findById(req.params.comment_id,function(err,foundComment){
        if(err){
            res.redirect("back");
        }
        else
        {
            res.render("comments/edit",{campground_id : req.params.id,comment:foundComment});
        }
    });

});

app.put("/campgrounds/:id/comments/:comment_id",middlewareObj.checkCommentOwnership,function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedComment){
        if(err)
        {
            res.redirect("back");
        }
        else
        {
            req.flash("success","Successfully edited comment!!!");
            res.redirect("/campgrounds/"+ req.params.id);
        }
    });
});

app.delete("/campgrounds/:id/comments/:comment_id",middlewareObj.checkCommentOwnership,function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id,function(err){
        if(err)
        {res.redirect("back");}
        else
        {
            req.flash("success","Successfully deleted comment!!!");
            res.redirect("/campgrounds/"+req.params.id);
        }
    });
});

app.get("/register",function(req,res){
        res.render("register");
    });
app.post("/register",function(req,res){
        User.register(new User({username:req.body.username}),req.body.password,function(err,user){
            if(err)
            {
                req.flash("error",err.message);
                res.redirect("/register");
            }
            passport.authenticate("local")(req,res,function(){
                req.flash("success","Welcome to YelpCamp" + user.username);
                res.redirect("/campgrounds");
            });
        });
    });
    
app.get("/login",function(req,res){
        res.render("login");
    });
    
app.post("/login",passport.authenticate("local",{
        successRedirect:"/campgrounds",
        failureRedirect:"/login"
    }),function(req,res){
    
    });
    
app.get("/logout",function(req,res){
        req.logout();
        req.flash("success","Logged you out!!");
        res.redirect("/campgrounds");
    });
    
    
app.listen(port, function(){
    console.log("Server has started!!");
});