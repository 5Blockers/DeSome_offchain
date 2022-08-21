const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types
const postSchema = new mongoose.Schema({
    caption:{
        type:String,
        required:true
    },
    resources:[{
        link:String,
        NFT:{type:Boolean,default:false},
        display:{type:Boolean,default:true},
        authorized: {type:String,enum : ['Yes','No','Pending'], default:'Yes'}
    }],
    likes:[{
        type:ObjectId,
        ref:"User"
    }],
    comments:[{
        text:String,
        postedBy:{
            type:ObjectId,
            ref:"User"
        }
    }],
    postedBy:{
        type:ObjectId,
        ref:"User"
    },
    privacy:{
        type:Boolean,
        default:true
    }
},{timestamps:true})

mongoose.model("Post", postSchema)