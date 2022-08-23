const Message = require('../models/message')

async function addMessage(req, res) {
    try {
        const from = req.user._id.toString()
        const {to, message} = req.body
        const newMessage = new Message({
            message,
            users: [from, to],
            sender: from
        })
        const result = newMessage.save()
        res.status(200).json({
            success: true,
            data: {
                message: 'Message added successfully'
            }
        })
    }
    catch(err) {
        return res.status(500).json({
            success: false, 
            data: {
                message: err.message
            }
        })
    }
}

async function getAllMessage(req, res) {
    try {
        const from = req.user._id.toString()
        console.log(from)
        const {to} = req.body
        const messages = await Message
            .find({users: {$all: [from, to]}})
            .sort({updatedBy: 1})
        const projectMessages = messages.map((msg) => {
            return {
                fromSelf: msg.sender.toString() === from,
                message: msg.message
            }
        })
        res.status(200).json({
            success: true,
            data: {
                projectMessages
            }
        })
    }
    catch(err) {
        return res.status(500).json({
            success: false, 
            data: {
                message: err.message
            }
        })
    }
}

module.exports = {
    addMessage,
    getAllMessage
}
