const express = require('express')
const router = express.Router()
const requireLogin = require('../middlewares/requireLogin')
const controller = require('../controllers/reportController')


router.put('/', requireLogin, controller.report)

module.exports = router