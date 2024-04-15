const express = require("express")
const cors = require("cors")
const userRouter=require("./controllers/userRouter")

const app = express()

app.use(express.json())
app.use(cors())

app.use('/api/users',userRouter)

app.listen(4004,()=>{
  console.log("Server running at 4004")
})