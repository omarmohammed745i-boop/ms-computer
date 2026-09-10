const mongoose = require("mongoose");



const productSchema = new mongoose.Schema({



    name:{

        type:String,

        required:true,

        trim:true

    },





    price:{

        type:Number,

        required:true,

        min:0

    },





    purchasePrice:{


        type:Number,


        default:0,


        min:0


    },





    oldPrice:{


        type:Number,


        default:0,


        min:0


    },





    // ======================
    // MAIN IMAGE
    // ======================


    image:{


        type:String,


        default:""


    },





    // ======================
    // PRODUCT IMAGES GALLERY
    // MAX 5 IMAGES
    // ======================


    images:{


        type:[String],


        default:[],


        validate:{


            validator:function(value){


                return value.length <= 5;


            },


            message:
            "Maximum 5 images allowed"



        }


    },









    description:{


        type:String,


        default:"",


        trim:true


    },





    details:{


        type:String,


        default:""


    },
    // ======================
// PRODUCT DETAILS SECTIONS
// ======================

detailsSections:{

    type:[
        {
            title:{
                type:String,
                default:""
            },

            content:{
                type:String,
                default:""
            }
        }
    ],

    default:[]

},




    category:{


        type:String,


        default:"General",


        trim:true


    },





    stock:{


        type:Number,


        default:0,


        min:0


    },









    // ======================
    // PRODUCT SPECIFICATIONS
    // ======================



    specifications:{



        color:{


            enabled:{
                type:Boolean,
                default:false
            },


            value:{
                type:String,
                default:""
            }


        },





        switchColor:{


            enabled:{
                type:Boolean,
                default:false
            },


            value:{
                type:String,
                default:""
            }


        },








        material:{


            enabled:{
                type:Boolean,
                default:false
            },


            value:{
                type:String,
                default:""
            }


        },








        weight:{


            enabled:{
                type:Boolean,
                default:false
            },


            value:{
                type:String,
                default:""
            }


        },








        size:{


            enabled:{
                type:Boolean,
                default:false
            },


            value:{
                type:String,
                default:""
            }


        },








        cableLength:{


            enabled:{
                type:Boolean,
                default:false
            },


            value:{
                type:String,
                default:""
            }


        },








        connection:{


            enabled:{
                type:Boolean,
                default:false
            },


            value:{
                type:String,
                default:""
            }


        },








        compatible:{


            enabled:{
                type:Boolean,
                default:false
            },


            value:{
                type:String,
                default:""
            }


        }




    },









    // ======================
    // PRODUCT STATISTICS
    // ======================



    views:{


        type:Number,


        default:0


    },





    cartAdds:{


        type:Number,


        default:0


    },





    orders:{


        type:Number,


        default:0


    },





    sold:{


        type:Number,


        default:0


    }





},{


    timestamps:true


});







module.exports = mongoose.model(

    "Product",

    productSchema

);