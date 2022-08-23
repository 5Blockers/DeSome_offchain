const mongoose = require('mongoose')

const imageSchema = mongoose.Schema({
    link: {
        type: String,
        require: true
    },
    code: {
        type: Array,
        require: true
    }
})

const Image = mongoose.model('Image', imageSchema)
module.exports = Image