require('dotenv').config()
const express = require('express')
const userRouter = require('./routes/users.routes')

const app = express()

const PORT = process.env.PORT || 3000

app.use(express.json())
app.use('/', userRouter)

app.use(function(req, res) {
    res.status(404).json({error: "Path not found"});
});

app.use(function(error, req, res) {
    res.status(500).json({error: "Something went wrong"});
});
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
})

