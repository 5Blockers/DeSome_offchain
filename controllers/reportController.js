const Post = require('../models/post')
const User = require('../models/user')

exports.report = async (req, res) => {
    try {
        const {invalidLink, invalidUserId, reportCode} = req.body
        if (reportCode !== process.env.REPORT_CODE) {
            return res.status(403).json({
                success: false,
                data: {
                    message: 'You have no permission'
                }
            })
        }
        const posts = await Post.find().select()
        let invalidPostId
        posts.forEach((post) => {
            post.resources.forEach((resource) => {
                if (resource.link === invalidLink && resource.NFT) {
                    invalidPostId = post._id
                }
            })
        })
        const invalidPost = await Post.findById(invalidPostId).select({resources: 1})
        invalidPost.resources.forEach((resource) => {
            if (resource.link === invalidLink && resource.NFT && resource.display == true) {
                resource.display = false
                resource.authorized = 'No'
            }
        })
        await invalidPost.save()

        const invalidUser = await User.findById(invalidUserId)
        if (!invalidUser.flags) invalidUser.flags = 1
        else invalidUser.flags++
        await invalidUser.save()

        res.status(200).json({
            success: true,
            data: {
                message: 'Reported successfully'
            }
        })
    }
    catch(err) {
        return  res.status(500).json({
            success: false,
            data: {
                message: err.message
            }
        })
    }

}