import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken"
import validator from "validator"
import bcrypt from "bcrypt"


const generateToken = (id)=>{
    return jwt.sign({id},process.env.JWT_SECRET_KEY)
}

const signup = async(req,res)=>{
    const {username,fullName,email,phoneNumber,password} = req.body
    try {
        const existedUser = await User.findOne({
            $or:[
                {username:username},
                {email:email},
                {phoneNumber:phoneNumber}
            ]
        })

        if(existedUser){
            if(existedUser.username===username){
                return res.status(400).json({success:false,message:"User already exist with this username"})
            }
            if(existedUser.email===email){
                return res.status(400).json({success:false,message:"User already exist with this email"})
            }
            if(existedUser.phoneNumber===phoneNumber){
                return res.status(400).json({success:false,message:"User already exist with this phone number"})
            }
        }

        if(!validator.isEmail(email)){
            return res.status(400).json({success:false,message:"Enter a valid email"})
        }

         if(password.length<8){
            return res.json({success:false,message:"Give a strong password"})
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        if(!hashedPassword){
            return res.json({success:false,message:"Error in sign up process"})
        }

        const newUser = new User({
            username,
            fullName,
            email,
            phoneNumber,
            password:hashedPassword
        })

        const user = await newUser.save();
        if(!user){
            return res.json({success:false,message:"Error in creating the user"})
        }

        const token = generateToken(user._id)
        if(!token){
            return res.status(404).json({success:false,message:"Error in generating token"})
        }

        return res.status(200).json({success:true,token})

    } catch (error) {
        console.log(error,"Error in sign up")
        return res.status(400).json({success:false,message:"Error in the sign up"})
    }
}

const signin = async (req,res)=>{
    const {identifier,password} = req.body || {}
    try {
        const user = await User.findOne({
            $or:[
                {username:identifier},
                {email:identifier},
                {phoneNumber:identifier}
            ]
        })

        if(!user){
            return res.status(400).json({success:false,message:"User not Found!"})
        }

        const isMatched= await bcrypt.compare(password,user.password)

        if(!isMatched){
            return res.status(400).json({success:false,message:"Invalid Credential!"})
        }

        const token = generateToken(user._id)
        if(!token){
            return res.status(400).json({success:false,message:'Error in generating the token'})
        }

        return res.status(200).json({success:true,token})


    } catch (error) {
        console.log(error,"error in sign in")
        return res.status(400).json({success:false,message:"Error in sign in"})
    }
}

export {
    signin,
    signup
}