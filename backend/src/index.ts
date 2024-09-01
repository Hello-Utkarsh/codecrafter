import express from 'express'
import { createServer } from 'http'
import { initWs } from './ws'
import cors from 'cors'
import { copyDir, createDir } from './fs'
const app = express()

app.use(cors())
const httpServer = createServer(app)
initWs(httpServer)

app.get('/', (req, res) => {
    console.log("hello")
    res.send("Hello from Express server!");
})

httpServer.listen(3000, () => {
    console.log('connected')
})