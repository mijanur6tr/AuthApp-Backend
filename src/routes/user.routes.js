import express from "express"
import { signin, signup } from "../controllers/user.controllers.js"



const userRouter = express.Router();


userRouter.post("/login",signin);
userRouter.post("/signup",signup)

export {userRouter};