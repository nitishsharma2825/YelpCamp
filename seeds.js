var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");

var data = [{
    name:"Santa Crust",
    image:"https://photosforclass.com/download/flickr-7121863467",
    description:"This is camping site."
    },
    {    name:"Santa Crust",
    image:"https://photosforclass.com/download/flickr-7121863467",
    description:"This is camping site."
    },
    {
    name:"Santa Crust",
    image:"https://photosforclass.com/download/flickr-7121863467",
    description:"This is camping site." 
    }

];

function seedDB(){
    Campground.remove({},function(err){
      if(err)
       {console.log(err);}
       else
       {
            console.log("All campgrounds deleted!!!");
      }
    });
}

//data.forEach(function(seed){
//Campground.create(seed,function(err,campground){
//if(err)
//{
  //  console.log(err);
//}
//else{
    //console.log("Campground created!!");
    //Comment.create({
       // text:"Hi!! You are Welcome here.",
     //   author:"Homer"
   // },function(err,comment){
       // campground.comments.push(comment);
      //  campground.save();
    //    console.log("Comment Added");

  //  });
//}
//});
//});
module.exports=seedDB;