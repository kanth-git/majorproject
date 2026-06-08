require("dotenv").config();
const dns=require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const app=  express();
const mongoose= require("mongoose");
const Listing = require("./models/listing.js");
const path= require("path");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError= require("./utils/ExpressError.js");
const session= require("express-session");

let MongoStore = require("connect-mongo");
if (MongoStore && typeof MongoStore !== 'function' && MongoStore.default) {
  MongoStore = MongoStore.default;
}
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const {listingSchema,reviewSchema} =  require("./schema.js");
const Review = require("./models/review.js");

const listingRouter= require("./routes/listings.js");
const reviewRouter = require("./routes/reviews.js");
const userRouter= require("./routes/user.js");



const methodOverride= require("method-override");


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const dbUrl = process.env.ATLASDB_URL;

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto:{
    secret:process.env.SECRET,
  },
  touchAfter:24*60*60
})

store.on("error",(err)=>{
  console.log("ERROR in MONGO SESSION STORE",err);
})

app.use(flash());
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie:{
    expires:Date.now() + 7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly: true,
  }
};

 

app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({ usernameField: 'email' }, User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  const successMsgs = req.flash("success");
  const errorMsgs = req.flash("error");
  res.locals.success = successMsgs.length > 0 ? successMsgs.join(" | ") : null;
  res.locals.error = errorMsgs.length > 0 ? errorMsgs.join(" | ") : null;
  console.log("flash message:", { success: res.locals.success, error: res.locals.error });
    res.locals.currUser = req.user;  
  next();
})




console.log("dbUrl =", dbUrl);

async function main() {
    try {
        console.log("Connecting to MongoDB...");

        await mongoose.connect(dbUrl, {
            serverSelectionTimeoutMS: 10000,
        });

        console.log("✅ Connected to DB");

        app.listen(8080, () => {
            console.log("🚀 Server is listening on port 8080");
        });

    } catch (err) {
        console.error("❌ Database connection error:", err);
    }
}

main();

mongoose.connection.on("connected", () => {
    console.log("Mongoose Connected");
});

mongoose.connection.on("error", (err) => {
    console.log("Mongoose Error:", err);
});

mongoose.connection.on("disconnected", () => {
    console.log("Mongoose Disconnected");
});

app.use("/", userRouter);
app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);






app.use((err,req,res,next)=>{
  console.error("ERROR:", err);
  let {statusCode=500,message="something went wrong" }= err;
  res.status(statusCode).render("error.ejs",{message});
})
