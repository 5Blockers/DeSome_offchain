const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types

const messageSchema = mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    users: {
        type: Array
    },
    sender: {
        type: ObjectId,
        ref: 'User',
        required: true
    }
}, {timestamps: true})

const Message = mongoose.model('Message', messageSchema)
module.exports = Message