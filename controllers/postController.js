const mongoose = require('mongoose')
const Post = mongoose.model("Post")

//get followers posts
exports.getFollowersPosts = (req, res)=>{
    Post.find({postedBy:{$in:req.user.following},privacy:true})
    .populate("postedBy","_id displayname")
    .populate("comments.postedBy","_id displayname")
    .sort('-createdAt')
    .then(posts=>{
        res.json({posts})
    })
    .catch(err=>{
        console.log(err);
    })
}

//create a post
exports.createPost = (req, res)=>{
    const {caption,resources,privacy} = req.body
    if (!caption) {
        res.status(422).json({error:"Please add a caption"})
    }
    const post = new Post({
        caption,
        resources,
        privacy,
        postedBy:req.user
    })
    post.save().then(result=>{
        res.json({post:result})
    })
    .catch(err=>{
        console.log(err);
    })
}

//get owner post
exports.getOwnerPosts = (req, res)=>{
    Post.find({postedBy:req.user._id})
    .populate("postedBy","_id displayname")
    .then(mypost=>{
        res.json({mypost})
    })
    .catch(err=>{
        console.log(err);
    })
}

//like
exports.like = (req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{likes:req.user._id}
    },{
        new:true
    })
    .populate("comments.postedBy","_id displayname")
    .populate("postedBy","_id displayname")
    .exec((err,result)=>{
        if (err) {
            return res.status(422).json({error:err})
        }else{
            res.json(result)
        }
    })
}

//unlike
exports.unlike = (req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $pull:{likes:req.user._id}
    },{
        new:true
    })
    .populate("comments.postedBy","_id displayname")
    .populate("postedBy","_id displayname")
    .exec((err,result)=>{
        if (err) {
            return res.status(422).json({error:err})
        }else{
            res.json(result)
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
    .populate("comments.postedBy","_id displayname")
    .populate("postedBy","_id displayname")
    .exec((err,result)=>{
        if (err) {
            return res.status(422).json({error:err})
        }else{
            res.json(result)
        }
    })
}