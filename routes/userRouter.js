const express = require('express')
const router = express.Router()
const requireLogin = require('../middlewares/requireLogin')
const controller = require('../controllers/userController')


router.post('/sign-up', controller.signUp)

router.post('/log-in', controller.login)

router.get('/:id',requireLogin,controller.getAnotherProfileUser)

router.post('/search-user',controller.searchAccount)

router.put('/update-profile',requireLogin,controller.updateProfileUser)

router.put('/follow', requireLogin, controller.follow)

router.put('/unfollow', requireLogin, controller.unfollow)

module.exports = router