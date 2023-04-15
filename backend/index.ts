import express from 'express'
import env from './config'

const app = express()
app.use(express.json())
app.get('/', (req, res)=>{
    return res.send("hello")
})
app.listen(env.PORT, ()=>{
    console.log(`server running at: http://localhost:${env.PORT}/`)
})