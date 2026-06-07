
const ExpressError= require("./utils/ExpressError.js");
const {listingSchema,reviewSchema} =  require("./schema.js");
const Listing = require("./models/listing");
const Review = require("./models/review.js");


module.exports.isLoggedIn = (req,res,next)=>{  
  
if(!req.isAuthenticated()){
  req.session.redirectUrl = req.originalUrl;
      req.flash("error", "you must be logged in to create listing!.");
      return res.redirect("/login");
  }
  next();
}

module.exports.saveRedirectUrl = (req,res,next)=>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl= req.session.redirectUrl;
  }
  next();
}

module.exports.isOwner =async(req,res,next)=>{
  let{id}= req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
      req.flash("error", "Listing you are looking for does not exist!");
      return res.redirect("/listings");
  }
  // listing.owner is usually an ObjectId; accessing ._id on it will fail if not populated
  if( !res.locals.currUser || !listing.owner.equals(res.locals.currUser._id)){
      req.flash("error","You are not the owner of this listing!");
      return res.redirect(`/listings/${id}`);
    }
  next();
}

module.exports.validateListing = (req,res,next)=>{
  console.log("validateListing - req.body:", req.body);
  let {error}=  listingSchema.validate(req.body);
   if(error){
    let errMsg = error.details.map((el)=> el.message).join(",");
    return next(new ExpressError(400,errMsg));
   }else{
    next();
   }
}
   
 module.exports.validateReview = (req,res,next)=>{
  let {error}=  reviewSchema.validate(req.body);
   if(error){
    let errMsg = error.details.map((el)=> el.message).join(",");
    return next(new ExpressError(400,errMsg));
   }else{
    next();
   }
}

  
module.exports.isReviewAuthor =async(req,res,next)=>{
  let{id,reviewId}= req.params;
  let review = await Review.findById(reviewId);
  if (!review) {
      req.flash("error", "Review you are looking for does not exist!");
      return res.redirect(`/listings/${id}`);
  }
  // Added check for currUser existence to prevent errors
  if( !res.locals.currUser || !review.author.equals(res.locals.currUser._id) ){
      req.flash("error","You are not the author of this review!");
      return res.redirect(`/listings/${id}`);
    }
  next();
}
