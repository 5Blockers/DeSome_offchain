const mongoose = require('mongoose')
const Post = mongoose.model("Post")
const User = mongoose.model("User")


//Update personal information
exports.updateProfileUser = (req,res)=>{
    User.findByIdAndUpdate(req.user._id,{
        $set:{
            displayname:req.body.displayname,
            email:req.body.email,
            tagname:req.body.tagname,
            bio:req.body.bio,
            avatar:req.body.avatar,
            background:req.body.background
        }
    },{new:true},(err,result)=>{
        if (err) {
            return res.status(422).json({error:"Pic can not post"})
        }
        res.json(result)
    })
}

//Profile other users (Not sign in user)
exports.getAnotherProfileUser = (req,res)=>{
    User.findOne({_id:req.params.id})
    .select("-password")
    .then(user=>{
        Post.find({postedBy:req.params.id})
        .populate("postedBy","_id displayname")
        .exec((err,posts)=>{
            if (err) {
                return res.status(422).json({error:err})
            }
            res.json({user,posts})
        })
    }).catch(err=>{
        return res.status(404).json({error:"User not found"})
    })
}

//follow a user
exports.follow = (req,res)=>{
    User.findByIdAndUpdate(req.body.followId,{
        $push:{followers:req.user._id}
    },{new:true},(err,result)=>{
        if (err) {
            return res.status(422).json({error:err})
        }
        User.findByIdAndUpdate(req.user._id,{
            $push:{following:req.body.followId}
        },{new:true}).select("-password").then(result=>{
            res.json(result)
        }).catch(err=>{
            return res.status(422).json({error:err})
        })
    })
}

//unfollow a user
exports.unfollow = (req,res)=>{
    User.findByIdAndUpdate(req.body.unfollowId,{
        $pull:{followers:req.user._id}
    },{new:true},(err,result)=>{
        if (err) {
            return res.status(422).json({error:err})
        }
        User.findByIdAndUpdate(req.user._id,{
            $pull:{following:req.body.unfollowId}
        },{new:true}).select("-password").then(result=>{
            res.json(result)
        }).catch(err=>{
            return res.status(422).json({error:err})
        })
    })
}

//search a user
exports.searchAccount = (req,res)=>{
    let userPattern = new RegExp("^"+req.body.query)
    User.find({email:{$regex:userPattern}})
    .select("_id displayname tagname")
    .then(user=>{
        res.json({user})
    }).catch(err=>{
        console.log(err);
    })
}