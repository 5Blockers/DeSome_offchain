const express = require('express')
const router = express.Router()
const requireLogin = require('../middlewares/requireLogin')
const controller = require('../controllers/postController')

router.get('/get-following-posts', requireLogin, controller.getFollowersPosts)

router.get('/my-posts', requireLogin, controller.getOwnerPosts)

router.get('/get-posts', requireLogin, controller.getPosts)

router.post('/create-post', requireLogin, controller.createPost)

router.put('/like', requireLogin, controller.like)

router.put('/unlike', requireLogin, controller.unlike)

router.put('/comment', requireLogin, controller.comments)



module.exports = router