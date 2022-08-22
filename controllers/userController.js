const mongoose = require('mongoose')
const Post = mongoose.model("Post")
const User = mongoose.model("User")
const jwt = require('jsonwebtoken')

//Sign up a user
exports.signUp = (req, res)=>{
    const {principal, displayname, tagname} = req.body
    if (!principal|| !displayname || !tagname) {
        return res.status(422).json({error:"please add all the field"})
    }
    User.findOne({$or:[{principal:principal},{tagname:tagname}]}).then((saveUser)=>{
        if (saveUser) {
            if (saveUser.tagname === tagname) {
                return res.status(422).json({error:"This tagname is already in use"})
            }
            return res.status(422).json({error:'user already exists'})
        }
        const user = new User({
            principal,
            displayname,
            tagname
        })

        user.save()
        .then(user=>{
            res.json({message:"save successfully"})
        })
        .catch(err=>{
            console.log(err);
        })
        
    })
    .catch(err=>{
        console.log(err);
    })
}

//Log in
exports.login = (req, res) => {
    const {principal} = req.body
    User.findOne({principal:principal}).then(loginUser=>{
        if (!loginUser) {
            return res.status(422).json({error:"This account does not exist!"})
        }
        const token = jwt.sign({_id:loginUser._id}, process.env.JWT_SECRET_KEY)
        const {_id, principal, displayname, email, avatar, background, tagname, bio, following, followers} = loginUser
        res.json({token,user:{_id, principal, displayname, email, avatar, background, tagname, bio, following, followers}})
    }).catch(err=>{
        console.log(err);
    })
}

//Update personal information
exports.updateProfileUser = async (req,res)=>{
    await User.findByIdAndUpdate(req.user._id,{
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
            return res.status(422).json({error:err})
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
exports.follow = async (req,res)=>{
    await User.findByIdAndUpdate(req.body.followId,{
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
exports.unfollow = async (req,res)=>{
    await User.findByIdAndUpdate(req.body.unfollowId,{
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
    let userPattern = new RegExp(".*"+req.body.query+".*")
    User.find({$or:[{displayname:{$regex:userPattern}},{tagname:{$regex:userPattern}}]})
    .select("_id displayname tagname")
    .then(user=>{
        res.json({user})
    }).catch(err=>{
        console.log(err);
    })
}