const express = require("express");

const Product = require("../models/product");

const router = express.Router();



// ============================
// DEFAULT SPECIFICATIONS
// ============================

const defaultSpecifications = {

    color:{
        enabled:false,
        value:""
    },

    switchColor:{
        enabled:false,
        value:""
    },

    material:{
        enabled:false,
        value:""
    },

    weight:{
        enabled:false,
        value:""
    },

    size:{
        enabled:false,
        value:""
    },

    cableLength:{
        enabled:false,
        value:""
    },

    connection:{
        enabled:false,
        value:""
    },

    compatible:{
        enabled:false,
        value:""
    }

};







// ============================
// GET ALL PRODUCTS
// ============================

router.get("/", async(req,res)=>{


    try{


        const products =
        await Product.find()
        .sort({
            createdAt:-1
        });



        res.status(200).json(products);



    }

    catch(err){


        console.log(
            "GET PRODUCTS ERROR:",
            err
        );


        res.status(500).json({

            message:"Server Error"

        });


    }


});









// ============================
// GET SINGLE PRODUCT
// ============================

router.get("/:id", async(req,res)=>{


    try{


        const { id } = req.params;



        if(!id){

            return res.status(400).json({

                message:"Product ID Required"

            });

        }




        const product =
        await Product.findById(id);





        if(!product){


            return res.status(404).json({

                message:"Product Not Found"

            });


        }




        res.status(200).json(product);



    }

    catch(err){


        console.log(

            "GET SINGLE PRODUCT ERROR:",

            err

        );



        res.status(500).json({

            message:"Server Error"

        });


    }


});








// ============================
// ADD PRODUCT
// ============================

router.post("/", async(req,res)=>{


    try{


        const {

            name,

            price

        } = req.body;






        if(!name || price === undefined){


            return res.status(400).json({

                message:
                "Name and Price are required"

            });


        }






        const productData = {


            ...req.body,



            images:

            Array.isArray(req.body.images)

            ?

            req.body.images.slice(0,5)

            :

            [],





            specifications:


            req.body.specifications ||

            defaultSpecifications



        };







        const product =

        new Product(productData);





        await product.save();







        res.status(201).json({


            message:
            "Product Added Successfully",


            product


        });






    }


    catch(err){



        console.log(

            "ADD PRODUCT ERROR:",

            err

        );



        res.status(500).json({

            message:"Server Error"

        });


    }



});
// ============================
// UPDATE PRODUCT
// ============================


router.put("/:id", async(req,res)=>{


    try{


        const oldProduct =

        await Product.findById(
            req.params.id
        );





        if(!oldProduct){


            return res.status(404).json({

                message:
                "Product Not Found"

            });


        }







        let updateData = {


            ...req.body


        };








        // LIMIT IMAGES TO 5

        if(req.body.images){


            updateData.images =

            Array.isArray(req.body.images)

            ?

            req.body.images.slice(0,5)

            :

            [];



        }








        // MERGE SPECIFICATIONS

        if(req.body.specifications){



            updateData.specifications = {


                color:{

                    ...oldProduct.specifications?.color,

                    ...req.body.specifications.color

                },



                switchColor:{

                    ...oldProduct.specifications?.switchColor,

                    ...req.body.specifications.switchColor

                },



                material:{

                    ...oldProduct.specifications?.material,

                    ...req.body.specifications.material

                },



                weight:{

                    ...oldProduct.specifications?.weight,

                    ...req.body.specifications.weight

                },



                size:{

                    ...oldProduct.specifications?.size,

                    ...req.body.specifications.size

                },



                cableLength:{

                    ...oldProduct.specifications?.cableLength,

                    ...req.body.specifications.cableLength

                },



                connection:{

                    ...oldProduct.specifications?.connection,

                    ...req.body.specifications.connection

                },



                compatible:{

                    ...oldProduct.specifications?.compatible,

                    ...req.body.specifications.compatible

                }



            };


        }








        const product =

        await Product.findByIdAndUpdate(


            req.params.id,


            updateData,


            {


                new:true,


                runValidators:true


            }


        );







        res.json({


            message:
            "Product Updated Successfully",


            product



        });







    }


    catch(err){


        console.log(

            "UPDATE PRODUCT ERROR:",

            err

        );



        res.status(500).json({

            message:
            "Server Error"

        });


    }


});










// ============================
// UPDATE SPECIFICATIONS ONLY
// ============================


router.put("/:id/specifications", async(req,res)=>{


    try{


        const product =

        await Product.findByIdAndUpdate(


            req.params.id,


            {


                specifications:req.body


            },


            {


                new:true


            }


        );







        if(!product){


            return res.status(404).json({

                message:
                "Product Not Found"

            });


        }






        res.json({


            message:
            "Specifications Updated",


            specifications:
            product.specifications


        });





    }


    catch(err){



        console.log(

            "SPECIFICATIONS ERROR:",

            err

        );



        res.status(500).json({

            message:
            "Server Error"

        });



    }



});
// ============================
// DELETE PRODUCT
// ============================


router.delete("/:id", async(req,res)=>{


    try{


        const product =

        await Product.findByIdAndDelete(

            req.params.id

        );





        if(!product){


            return res.status(404).json({

                message:
                "Product Not Found"

            });


        }







        res.json({

            message:
            "Product Deleted Successfully"

        });






    }


    catch(err){


        console.log(

            "DELETE PRODUCT ERROR:",

            err

        );



        res.status(500).json({

            message:
            "Server Error"

        });



    }



});












// ============================
// CART ADD COUNTER
// ============================


router.put("/:id/cart-add", async(req,res)=>{


    try{


        const product =


        await Product.findByIdAndUpdate(


            req.params.id,


            {


                $inc:{


                    cartAdds:1


                }


            },


            {


                new:true


            }


        );








        if(!product){


            return res.status(404).json({

                message:
                "Product Not Found"

            });


        }






        res.json({


            message:
            "Cart Add Increased",


            cartAdds:
            product.cartAdds



        });






    }


    catch(err){


        console.log(

            "CART ADD ERROR:",

            err

        );



        res.status(500).json({

            message:
            "Server Error"

        });



    }



});











// ============================
// EXPORT ROUTER
// ============================


module.exports = router;