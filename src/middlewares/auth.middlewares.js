import jwt from "jsonwebtoken"

const authMiddleware = async ( req,res,next)=>{
    const {token} = req.headers;
  
    if(!token){
        return res.status(400).json({success:false,message:"Unauthorized. Again Login."})
    }
    try {
        const decodeToken = jwt.verify(token,process.env.JWT_SECRET_KEY)
        req.userId = decodeToken.id;
        next();
    } catch (error) {
        console.log(error,"Error exicuting authmiddleware")
        res.status(400).json({success:false,message:"Error exicuting authmiddleware"})
    }

}

export {authMiddleware}