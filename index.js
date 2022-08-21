const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const morgan = require('morgan')
dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000



mongoose.connect(process.env.MONGOURI, {useNewUrlParser: true})
mongoose.connection.on('connected', ()=>{
    console.log("Connect to mongodb successfully");
})

morgan.token('host', function(req, res) {
    return req.hostname;
});
app.use(morgan(':method :host :status :res[content-length] - :response-time ms'))

require('./models/post')
require('./models/user')
app.use(express.json())

app.listen(PORT, () => {
    console.log('Listenning on port '+PORT+'...')
})