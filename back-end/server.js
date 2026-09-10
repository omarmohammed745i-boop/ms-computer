const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// ✅ في Production، مش محتاج dotenv
if (process.env.NODE_ENV !== 'production') {
    require("dotenv").config();
}


const productRoutes = require("./routes/products");
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders");
const upload = require("./middleware/upload");



const app = express();


const PORT = process.env.PORT || 5000;



// =======================
// Middlewares
// =======================


app.use(cors());


app.use(express.json({

    limit:"10mb"

}));



app.use(express.urlencoded({

    extended:true

}));



app.use("/uploads", express.static("uploads"));







// =======================
// Upload Image
// =======================


app.post(

    "/api/upload",

    upload.single("image"),

    (req,res)=>{


        if(!req.file){


            return res.status(400).json({

                message:"No Image Selected"

            });


        }




        res.json({

            image:
            `http://localhost:${PORT}/uploads/${req.file.filename}`

        });



    }

);









// =======================
// API Routes
// =======================


app.use(

    "/api/products",

    productRoutes

);



app.use(

    "/api/auth",

    authRoutes

);



app.use(

    "/api/orders",

    orderRoutes

);








// =======================
// Test Route
// =======================


app.get("/",(req,res)=>{


    res.json({

        message:"MS Computer Backend is Running ✅"

    });


});








// =======================
// Error Handler
// =======================


app.use((err,req,res,next)=>{


    console.log(err);



    res.status(500).json({

        message:"Something went wrong"

    });



});









// =======================
// MongoDB Connection
// =======================


const startServer = async ()=>{


    try{


        if(!process.env.MONGODB_URI){


            console.log(
                "❌ MONGODB_URI is missing in .env"
            );


            return;

        }




        await mongoose.connect(

            process.env.MONGODB_URI

        );




        console.log(

            "✅ MongoDB Connected Successfully"

        );





        app.listen(PORT,()=>{


            console.log(

                `🚀 Server running on http://localhost:${PORT}`

            );


        });





    }catch(err){


        console.log(

            "❌ MongoDB Connection Error"

        );


        console.log(err);


    }



};





startServer();