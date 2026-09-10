const express = require("express");
const Order = require("../models/Order");

const router = express.Router();



// =======================
// Create Order
// =======================


router.post("/", async (req,res)=>{


    try{



        const {

            user,

            customerName,

            phone,

            address,

            paymentMethod,

            products,

            totalPrice


        } = req.body;






        if(

            !user ||

            !customerName ||

            !phone ||

            !address ||

            !paymentMethod ||

            !products ||

            products.length === 0 ||

            !totalPrice

        ){


            return res.status(400).json({

                message:"Please fill all order information"

            });


        }







        const order = new Order({


            user,

            customerName,

            phone,

            address,

            paymentMethod,

            products,

            totalPrice



        });






        await order.save();






        res.status(201).json({


            message:"Order Created Successfully",


            order



        });






    }catch(err){



        console.log(err);



        res.status(500).json({


            message:"Server Error"



        });



    }



});









// =======================
// Get All Orders
// =======================


router.get("/", async(req,res)=>{


    try{



        const orders = await Order

        .find()

        .populate("user")

        .populate("products.product");





        res.json(orders);






    }catch(err){



        console.log(err);



        res.status(500).json({


            message:"Server Error"



        });



    }



});








// =======================
// Get User Orders
// =======================


router.get("/user/:id", async(req,res)=>{


    try{


        const orders = await Order

        .find({

            user:req.params.id

        })

        .populate("products.product");






        res.json(orders);





    }catch(err){


        console.log(err);



        res.status(500).json({

            message:"Server Error"

        });



    }



});






module.exports = router;