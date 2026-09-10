const mongoose = require("mongoose");



const orderSchema = new mongoose.Schema({



    user:{


        type:mongoose.Schema.Types.ObjectId,

        ref:"User",

        required:true


    },





    customerName:{


        type:String,

        required:true,

        trim:true


    },





    phone:{


        type:String,

        required:true,

        trim:true


    },





    address:{


        type:String,

        required:true,

        trim:true


    },





    paymentMethod:{


        type:String,

        required:true,


        enum:[

            "Cash On Delivery",

            "InstaPay",

            "Vodafone Cash"

        ]


    },







    products:[


        {


            product:{


                type:mongoose.Schema.Types.ObjectId,

                ref:"Product",

                required:true


            },





            quantity:{


                type:Number,

                default:1,

                min:1


            }



        }



    ],








    totalPrice:{


        type:Number,

        required:true,

        min:0


    },







    status:{


        type:String,


        enum:[


            "Pending",

            "Processing",

            "Shipped",

            "Delivered",

            "Cancelled"


        ],



        default:"Pending"



    }






},{

    timestamps:true

});








module.exports = mongoose.model(

    "Order",

    orderSchema

);