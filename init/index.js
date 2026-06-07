const mongoose = require("mongoose");
const initData=  require("./data.js");
const Listing  = require("../models/listing.js");


async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlustDb");
}
async function initDB(){
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj,owner:"6a1a3e8b5a72fdb5d9416564"}));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
}
main().then(()=>{
  console.log("connected to db");
 initDB();
}).catch((err)=>{
  console.log("it was error",err);
})
