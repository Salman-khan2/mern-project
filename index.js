const express = require("express");
require("./db/config");
const User = require("./db/User");
const jwt = require("jsonwebtoken");
const jwtKey = "salman";
const app = express();
const cors = require("cors");
const Product = require('./db/Product');

app.use(express.json());
app.use(cors());
app.post("/signup", async (req, res) => {
    let data = new User(req.body);
    let result = await data.save();
    result = result.toObject();
    delete result.password
    jwt.sign({result},jwtKey,{expiresIn:"2h"},(error,token)=>{
        if(error){
            res.send({result:"something went wrong please try again"});
        }else{
            res.send({result,auth:token})
        }
        
    })
});

app.post('/login', async (req, res) => {
    let user = await User.findOne(req.body).select("-password");
    if (req.body.password && req.body.email) {
        if (user) {
            jwt.sign({user},jwtKey,{expiresIn:"2h"},(error,token)=>{
               if(error){
                res.send({result:"something went wrong please try again"})
               }
               res.send({user, auth:token});
            })
            
        } else {
            res.send({result:"No user Found"});
        }
    }else{
        res.send({result:"No user Found"});
    }
})
app.post("/add-product",verifyToken,async(req,res)=>{
    let product = new Product(req.body);
    let result = await product.save();
    res.send(result)
});

app.get('/products',verifyToken,async(req,res)=>{
    let products = await Product.find();
    if(products.length>0){
        res.send(products)
    }else{
        res.send({result : "No Result Found"})
    }
})

app.delete("/product/:id",verifyToken,async(req,res)=>{
    let result = await Product.deleteOne({_id:req.params.id})
    res.send(result);
})

app.get('/product/:id',verifyToken,async(req,res)=>{
    let result = await Product.findOne({_id:req.params.id})
    if(result){
        res.send(result);
    }
    else{
        res.send({result:"No Record Found"})
    }
})


app.put('/product/:id',verifyToken,async(req,res)=>{
    let result = await Product.updateOne(
        {_id:req.params.id},
        {
            $set:req.body
        }
    )
    res.send(result)
})

app.get("/search/:key",verifyToken,async (req,res)=>{
    let result = await Product.find(
        {
            "$or":[
                {name:{$regex: req.params.key}},
                {company:{$regex: req.params.key}},
                {category:{$regex: req.params.key}}
                
            ]
        }
    )
    res.send(result);
})

function verifyToken(req,res,next){
    let token = req.headers['authorization'];
    if(token){
        token = token.split(' ')[1];
        jwt.verify(token,jwtKey,(err,valid)=>{
            if(err){
                res.status(401).send({result:"Please Provide Valid Token"});
            }else{
                next();
            }

        })
    }
    else{
        res.status(403).send({result:"Please add token with header"})
    }
    
    
}


app.listen(5000);