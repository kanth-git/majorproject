const express= require("express");
const mongoose = require("mongoose");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {listingSchema,reviewSchema} =  require("../schema.js");
const {isLoggedIn, isOwner,validateListing} = require("../middleware.js");
const Listing = require("../models/listing.js");
const listingController = require("../controllers/listings.js");

const multer = require("multer");
const {storage}= require("../cloudConfig.js");

const upload = multer({storage});



router.route("/")
  .get(wrapAsync(listingController.index))
  .post(isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(listingController.createListing));
  // .post( upload.single("listing[image]"),(req,res)=>{
  //   res.send(req.file);
  // });

//new route
router.get("/new",isLoggedIn,listingController.renderNewForm);

router.route("/:id")  
  .get(wrapAsync(listingController.showListing))
  .put(isLoggedIn, isOwner,upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing))
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

//edit route
router.get("/:id/edit",isLoggedIn,wrapAsync(listingController.renderEditForm));

module.exports=  router;

// //index route
// router.get("/",wrapAsync(listingController.index));


// //new route
// router.get("/new",isLoggedIn,listingController.renderNewForm);


// //show route
// router.get("/:id",listingController.showListing);

// //create route
// router.post("/", isLoggedIn,validateListing,wrapAsync(listingController.createListing)
// )

// //edit route
// router.get("/:id/edit",isLoggedIn,wrapAsync(listingController.renderEditForm));

// //update route
// router.put("/:id",isLoggedIn,isOwner,validateListing,wrapAsync(listingController.updateListing));

// //delete route
// router.delete("/:id",isLoggedIn,wrapAsync(listingController.destroyListing));

