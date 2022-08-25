const mongoose = require('mongoose')
const Post = mongoose.model("Post")
const  Image = require('../models/image')

//get followers posts
exports.getFollowersPosts = (req, res)=>{
    Post.find({postedBy:{$in:req.user.following},privacy:true})
    .populate("postedBy","_id displayname tagname avatar")
    .populate("comments.postedBy","_id displayname tagname avatar")
    .sort('-createdAt')
    .then(posts=>{
        res.status(200).json({
            success: true,
            data: {
                posts
            }
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

//create a post
exports.createPost = (req, res)=>{
    const {caption,resources,privacy} = req.body
    if (!caption) {
        res.status(422).json({
            success: false,
            data: {
                error:"Please add a caption"
            }
        })
    }
    const post = new Post({
        caption,
        resources,
        privacy,
        postedBy:req.user
    })
    
    // //add to Image collection (Nguyen yeu cau)
    // resources
    // .filter((resource) => {
    //     return resource.NFT
    // })
    // .map((resource) => {
    //     const code = ['code' + resource.link] //change by AI
    //     return {
    //         link: resource.link,
    //         code
    //     }
    // })
    // .forEach((image) => {
    //     const  savedImage = new Image({
    //         link: image.link,
    //         code: image.code
    //     })
    //     savedImage.save()
    //         .then((result) => console.log('success'))
    //         .catch((err) => console.log('error'))
    // })

    
    post.save().then(result=>{
        res.status(200).json({
            success: true,
            data: {
                post:result
            }
        })
    })
    .catch(err=>{
        console.log(err);
    })
}

//get owner post
exports.getOwnerPosts = (req, res)=>{
    Post.find({postedBy:req.user._id})
    .populate("postedBy","_id displayname tagname avatar")
    .populate("comments.postedBy","_id displayname tagname avatar")
    .then(mypost=>{
        res.status(200).json({
            success: true,
            data: {
                mypost
            }
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

//like
// exports.like = (req,res)=>{
//     Post.findByIdAndUpdate(req.body.postId,{
//         $push:{likes:req.user._id}
//     },{
//         new:true
//     })
//     .populate("comments.postedBy","_id displayname")
//     .populate("postedBy","_id displayname")
//     .exec((err,result)=>{
//         if (err) {
//             return res.status(422).json({
//                 success: false,
//                 data: {
//                     message: err.message
//                 }
//             })
//         }else{
//             res.status(200).json({
//                 success: true,
//                 data: {
//                     result
//                 }
//             })
//         }
//     })
// }

//like remake
exports.like = async (req,res)=>{
    const post = await Post
                    .findById(req.body.postId)
                    .populate("comments.postedBy","_id displayname")
                    .populate("postedBy","_id displayname")
    if (post.likes.indexOf(req.user._id) !== -1) {
        return res.status(422).json({
                        success: false,
                        data: {
                            message: 'Already liked'
                        }
                    })
    }  
    post.likes.push(req.user._id)
    await post.save()
    res.status(200).json({
        success: true,
        data: {
            message: 'like successfully'
        }
    })
}

// //unlike
// exports.unlike = (req,res)=>{
//     Post.findByIdAndUpdate(req.body.postId,{
//         $pull:{likes:req.user._id}
//     },{
//         new:true
//     })
//     .populate("comments.postedBy","_id displayname")
//     .populate("postedBy","_id displayname")
//     .exec((err,result)=>{
//         if (err) {
//             return res.status(422).json({
//                 success: false,
//                 data: {
//                     message: err.message
//                 }
//             })
//         }else{
//             res.status(200).json({
//                 success: true,
//                 data: {
//                     result
//                 }
//             })
//         }
//     })
// }

//unlike remake
exports.unlike = async (req,res)=>{
    const post = await Post
                    .findById(req.body.postId)
                    .populate("comments.postedBy","_id displayname")
                    .populate("postedBy","_id displayname")
    if (post.likes.indexOf(req.user._id) === -1) {
        return res.status(422).json({
                        success: false,
                        data: {
                            message: 'Not like yet'
                        }
                    })
    } 
    post.likes.splice(post.likes.indexOf(req.user._id), 1)
    await post.save()
    res.status(200).json({
        success: true,
        data: {
            message: 'unlike successfully'
        }
    })
}

//comments
exports.comments = (req,res)=>{
    const comment = {
        text:req.body.text,
        postedBy:req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{comments:comment}
    },{
        new:true
    })
    .populate("comments.postedBy","_id displayname tagname avatar")
    .populate("postedBy","_id displayname tagname avatar")
    .exec((err,result)=>{
        if (err) {
            return res.status(422).json({
                success: false,
                data: {
                    message: err.message
                }
            })
        }else{
            res.status(200).json({
                success: true,
                data: {
                    result
                }
            })
        }
    })
}