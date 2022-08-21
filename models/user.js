const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types
const userSchema = new mongoose.Schema({
    principal: {
        type:String,
        // required:true,
    },
    displayname: {
        type:String,
        required:true,
    },
    email:{
        type:String
    },
    avatar:{
        type:String,
        default:"https://cdn0.iconfinder.com/data/icons/shopping-197/48/bl_872_profile_avatar_anonymous_customer_user_head_human-512.png" //default image
    },
    background:{
        type:String,
        default:"https://p4.wallpaperbetter.com/wallpaper/557/172/58/minimalism-background-mask-anonymous-wallpaper-preview.jpg" //default background
    },
    tagname:{
        type:String,
        unique:true,
    },
    bio:{
        type:String,
        default:""
    },
    followers:[{
        type:ObjectId,
        ref:"User"
    }],
    following:[{
        type:ObjectId,
        ref:"User"
    }],
    flags:{
        type:Number
    }
})

mongoose.model("User", userSchema)