const moongose = require("mongoose");

const productSchema = new moongose.Schema({
    name:String,
    price:String,
    category:String,
    userId:String,
    company:String
})

module.exports = moongose.model("prodcts",productSchema);