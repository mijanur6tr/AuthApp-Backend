import express from "express"
import { signin, signup, googleSignupLogin } from "../controllers/user.controllers.js"



const userRouter = express.Router();


userRouter.post("/login",signin);
userRouter.post("/signup",signup)
userRouter.post("/google-login",googleSignupLogin)

export {userRouter};