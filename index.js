const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const socket = require('socket.io')
const cors = require('cors')
const app = express()

require('dotenv').config()
app.use(cors())

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
app.use('/api/post',require('./routes/postRouter'))
app.use('/api/message',require('./routes/messageRouter'))
app.get('/test', (req, res) => {
  res.send('hello world ll')
})
//server
const PORT = process.env.PORT || 5000
const server = app.listen(PORT, () => {
    console.log(`Listenning on port ${PORT}...`)
})

//socket
const io = socket(server, {
    cors: {
      origin: process.env.FRONT_END_URL,
      credentials: true,
    }
});
  
global.onlineUsers = new Map();
io.on("connection", (socket) => {
    global.chatSocket = socket;

    socket.on("add-user", (userId) => {
      onlineUsers.set(userId, socket.id);
    });
  
    socket.on('send-message', (data) => {
      const sendUserSocket = onlineUsers.get(data.to);
      if (sendUserSocket) {
        io.to(sendUserSocket).emit('msg-receive', data.message);
      }
    });

    socket.on('check-online', (userId) => {
        const currentUser = onlineUsers.get(userId)
        let msg = false
        if (currentUser) msg = true
        io.to(currentUser).emit('is-online', msg)
    })
});