import express from 'express'
const app = express()

import userRouter from './user.routes'

app.use(express.json())

app.use('/', userRouter)

app.listen(3000, () => {
    console.log('Server running on port 3000')
})






