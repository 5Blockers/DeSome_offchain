const express = require('express')
const app = express()

app.get('/', (req, res) => {
    res.send('Hello world')
})

//Server
const port = 3000               //config in environment later
app.listen(port, () => {
    console.log('Listenning on port ' + port + '...')
})