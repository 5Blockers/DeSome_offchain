const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const app = express()
const PORT = process.env.PORT || 5000
require('dotenv').config()


mongoose.connect(process.env.MONGOURI, {useNewUrlParser: true})
mongoose.connection.on('connected', ()=>{
    console.log("Connect to mongodb successfully");
})

morgan.token('host', function(req, res) {
    return req.hostname;
});
app.use(morgan(':method :host :status :res[content-length] - :response-time ms'))

require('./models/user')
require('./models/post')
app.use(express.json())
app.use('/api/user',require('./routes/userRouter'))

app.listen(PORT, () => {
    console.log(`Listenning on port ${PORT}...`)
})