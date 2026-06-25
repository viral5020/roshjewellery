const mongoose = require("mongoose");
const SubCategory = require("./models/subCategory");

async function run() {
  await mongoose.connect("mongodb://viralajudia123:Viral023572@ecom-shard-00-00.v7hqz.mongodb.net:27017,ecom-shard-00-01.v7hqz.mongodb.net:27017,ecom-shard-00-02.v7hqz.mongodb.net:27017/test?ssl=true&replicaSet=atlas-k7m39p-shard-0&authSource=admin&retryWrites=true&w=majority&appName=ecom");
  const subCats = await SubCategory.find({});
  console.log("SUBCATS:", subCats);
  process.exit();
}
run();
