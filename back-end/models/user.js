const mongoose = require("mongoose");



const UserSchema = new mongoose.Schema({



    name:{


        type:String,

        required:true,

        trim:true


    },




    email:{


        type:String,

        required:true,

        unique:true,

        trim:true,

        lowercase:true


    },





    password:{


        type:String,

        required:true


    },





    image:{


        type:String,

        default:"default-avatar.png"


    },





    role:{


        type:String,

        enum:[

            "user",

            "admin"

        ],


        default:"user"


    }





},{

    timestamps:true

});







module.exports = mongoose.model(

    "User",

    UserSchema

);