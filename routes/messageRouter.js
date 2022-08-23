const express = require('express')
const router = express.Router()
const requireLogin = require('../middlewares/requireLogin')
const controller = require('../controllers/messageController')




router.post('/add-message', requireLogin, controller.addMessage)

router.post('/get-message', requireLogin, controller.getAllMessage)


module.exports = router