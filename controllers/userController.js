const mongoose = require('mongoose')
const Post = require('../models/post')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const {testMail} = require('../validators/validator')

//Sign up a user
exports.signUp = (req, res)=>{
    const {principal, displayname, tagname, email} = req.body
    if (!principal|| !displayname || !tagname || !email) {
        return res.status(422).json({
            success: false, 
            data: {
                message: "please add all the field"
            }
        })
    }
    if (!testMail(email)) {
        return res.status(400).json({
            success: false, 
            data: {
                message: "Not valid email"
            }
        })
    }
    User.findOne({$or:[{principal:principal},{tagname:tagname}]}).then((saveUser)=>{
        if (saveUser) {
            if (saveUser.tagname === tagname) {
                return res.status(422).json({
                    success: false,
                    data: {
                        message:"This tagname is already in use"
                    }
                })
            }
            return res.status(422).json({
                success: false,
                data: {
                    message:'user already exists'
                }
            })
        }
        const user = new User({
            principal,
            displayname,
            tagname,
            email
        })

        user.save()
        .then(user=>{
            res.status(200).json({
                success: true,
                data: {
                    message:"save successfully"
                }
            })
        })
        .catch(err=>{
            console.log(err.message)
            res.status(500).json({
                success: false,
                data: {
                    message: err.message
                }
            });
        })
        
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            success: false,
            data: {
                message: err.message
            }
        });
    })
}

//Log in
exports.login = (req, res) => {
    const {principal} = req.body
    User.findOne({principal:principal}).then(loginUser=>{
        if (!loginUser) {
            return res.status(422).json({
                success: false,
                data: {
                    message:"This account does not exist!"
                }
            })
        }
        const token = jwt.sign({_id:loginUser._id}, process.env.JWT_SECRET_KEY)
        const {_id, principal, displayname, email, avatar, background, tagname, bio, following, followers} = loginUser
        res.status(200).json({
            success: true,
            data: {
                token,
                user: {_id, principal, displayname, email, avatar, background, tagname, bio, following, followers}
            }
        })
    }).catch(err=>{
        console.log(err);
        res.status(500).json({
            success: false,
            data: {
                message: err.message
            }
        });
    })
}

//Update personal information
exports.updateProfileUser = async (req,res)=>{
    if (!testMail(req.body.email)) {
        return res.status(400).json({
            success: false, 
            data: {
                message: "Not valid email"
            }
        })
    }
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
            return res.status(422).json({
                success: false,
                data: {
                    message: err.message
                }
            })
        }
        res.status(200).json({
            success: true,
            data: {
                result
            }
        })
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
                return res.status(422).json({
                    success: false,
                    data: {
                        message: err.message
                    }
                })
            }
            res.status(200).json({
                success: true,
                data: {
                    user, posts
                }
            })
        })
    }).catch(err=>{
        return res.status(404).json({
            success: false,
            data: {
                message: "User not found"
            }
        })
    })
}

//follow a user
exports.follow = async (req,res)=>{
    await User.findByIdAndUpdate(req.body.followId,{
        $push:{followers:req.user._id}
    },{new:true},(err,result)=>{
        if (err) {
            return res.status(422).json({
                success: false,
                data: {
                    message: err.message
                }
            })
        }
        User.findByIdAndUpdate(req.user._id,{
            $push:{following:req.body.followId}
        },{new:true}).select("-password").then(result=>{
            res.status(200).json({
                success: true,
                data: {
                    result
                }
            })
        }).catch(err=>{
            return res.status(422).json({
                success: false,
                data: {
                    message: err.message
                }
            })
        })
    })
}

//unfollow a user
exports.unfollow = async (req,res)=>{
    await User.findByIdAndUpdate(req.body.unfollowId,{
        $pull:{followers:req.user._id}
    },{new:true},(err,result)=>{
        if (err) {
            return res.status(422).json({
                success: false,
                data: {
                    message: err.message
                }
            })
        }
        User.findByIdAndUpdate(req.user._id,{
            $pull:{following:req.body.unfollowId}
        },{new:true}).select("-password").then(result=>{
            res.status(200).json({
                success: true,
                data: {
                    result
                }
            })
        }).catch(err=>{
            return res.status(422).json({
                success: false,
                data: {
                    message: err.message
                }
            })
        })
    })
}

//search a user
exports.searchAccount = (req,res)=>{
    let userPattern = new RegExp(".*"+req.body.query+".*")
    User.find({$or:[{displayname:{$regex:userPattern}},{tagname:{$regex:userPattern}}]})
    .select("_id displayname tagname")
    .then(user=>{
        res.status(200).json({
            success: true,
            data: {
                user
            }
        })
    }).catch(err=>{
        console.log(err);
        res.status(500).json({
            success: false,
            data: {
                message: err.message
            }
        });
    })
}