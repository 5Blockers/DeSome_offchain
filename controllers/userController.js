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
            background:req.body.background,
            flags: 0
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

exports.getAllUsers = (req, res)=>{
    User.find()
    .then(user=>{
        res.status(200).json({
            success: true,
            data: {
                user
            }
        })
    })
    .catch(err=>{
        res.status(500).json({
            success: false,
            data: {
                message: err.message
            }
        });
    })
}

//Profile other users (Not sign in user)
exports.getAnotherProfileUser = (req,res)=>{
    User.findOne({_id:req.params.id})
    .then(user=>{
        Post.find({postedBy:req.params.id})
        .populate("comments.postedBy","_id displayname tagname avatar")
        .populate("postedBy","_id displayname tagname avatar")
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

// //follow a user
// exports.follow = async (req,res)=>{
//     await User.findByIdAndUpdate(req.body.followId,{
//         $push:{followers:req.user._id}
//     },{new:true},(err,result)=>{
//         if (err) {
//             return res.status(422).json({
//                 success: false,
//                 data: {
//                     message: err.message
//                 }
//             })
//         }
//         User.findByIdAndUpdate(req.user._id,{
//             $push:{following:req.body.followId}
//         },{new:true}).select("-password").then(result=>{
//             res.status(200).json({
//                 success: true,
//                 data: {
//                     result
//                 }
//             })
//         }).catch(err=>{
//             return res.status(422).json({
//                 success: false,
//                 data: {
//                     message: err.message
//                 }
//             })
//         })
//     })
// }

// //unfollow a user
// exports.unfollow = async (req,res)=>{
//     await User.findByIdAndUpdate(req.body.unfollowId,{
//         $pull:{followers:req.user._id}
//     },{new:true},(err,result)=>{
//         if (err) {
//             return res.status(422).json({
//                 success: false,
//                 data: {
//                     message: err.message
//                 }
//             })
//         }
//         User.findByIdAndUpdate(req.user._id,{
//             $pull:{following:req.body.unfollowId}
//         },{new:true}).select("-password").then(result=>{
//             res.status(200).json({
//                 success: true,
//                 data: {
//                     result
//                 }
//             })
//         }).catch(err=>{
//             return res.status(422).json({
//                 success: false,
//                 data: {
//                     message: err.message
//                 }
//             })
//         })
//     })
// }

//follow remake
exports.follow = async (req,res)=>{
    try {
        if (req.user._id == req.body.followId) {
            return res.status(422).json({
                success: false,
                data: {
                    message: 'Can not follow yourself'
                }
            })
        }
        const to = await User.findById(req.body.followId)
        if (to.followers.indexOf(req.user._id) !== -1) {
            return res.status(422).json({
                success: false,
                data: {
                    message: 'already following'
                }
            })
        }
        to.followers.push(req.user._id)
        await to.save()

        const from = await User.findById(req.user._id)
        from.following.push(req.body.followId)
        await from.save()
        res.status(200).json({
            success: false,
            data: {
                message: 'follow successfully'
            }
        })
    }
    catch(err) {
        res.status(500).json({
            success: false,
            data: {
                message: err.message
            }
        })
    } 
}

//unfollow remake
exports.unfollow = async (req,res)=>{
    try {
        const to = await User.findById(req.body.unfollowId)
        if (to.followers.indexOf(req.user._id) === -1) {
            return res.status(422).json({
                success: false,
                data: {
                    message: 'not following'
                }
            })
        }
        to.followers.splice(to.followers.indexOf(req.user._id), 1)
        await to.save()

        const from = await User.findById(req.user._id)
        from.following.splice(to.following.indexOf(req.body.unfollowId), 1)
        await from.save()
        res.status(200).json({
            success: false,
            data: {
                message: 'unfollow successfully'
            }
        })
    }
    catch(err) {
        res.status(500).json({
            success: false,
            data: {
                message: err.message
            }
        })
    }  
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

//get current user ID
exports.getCurrentUser = (req, res) => {
    if (req.user) {
        return res.status(200).json({
            success: true,
            data: {
                user: req.user
            }
        })
    }
}

//get all chat users
exports.getAllChatUsers = async (req, res) => {
    try {
        const chatListId = [...req.user.followers, ...req.user.following]
        const chatList = []
        for (let id of chatListId) {
            const user = await User.findById(id).select({_id: 1, principal: 1, displayname: 1, tagname: 1, avatar: 1})
            chatList.push(user)
        }
        res.status(200).json({
            success: true,
            data: {
                chatList
            }
        })
    
    }
    catch(err) {
        res.status(500).json({
            success: false,
            data: {
                message: err.message
            }
        })
    }
}