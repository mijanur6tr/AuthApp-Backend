import express , {json} from "express"
import cors from "cors"
import  connectDb  from "./config/db.js"
import { userRouter } from "./routes/user.routes.js"
import "dotenv/config"


const app = express()
const port = process.env.PORT;

//middlewares

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors())

//database
connectDb()


//api endpoint
app.use("/api/user",userRouter)


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port  http://localhost:${port}`)
})