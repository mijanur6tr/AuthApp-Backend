import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";
import validator from "validator";
import bcrypt from "bcrypt";

const generateToken = (id,role) => {
  return jwt.sign(
      { id, role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    )
};

const signup = async (req, res) => {
  const { username, fullName, email, phoneNumber, password,provider } = req.body;
  try {
    if (provider === "local") {
      if (!username || !phoneNumber || !password) {
        return res
          .status(400)
          .json({ success: false, message: "All fields are required" });
      }
    }
    const existedUser = await User.findOne({
      $or: [
        { username: username },
        { email: email },
        { phoneNumber: phoneNumber },
      ],
    });

    if (existedUser) {
      if (existedUser.username === username) {
        return res.status(400).json({
          success: false,
          message: "User already exist with this username",
        });
      }
      if (existedUser.email === email) {
        return res.status(400).json({
          success: false,
          message: "User already exist with this email",
        });
      }
      if (existedUser.phoneNumber === phoneNumber) {
        return res.status(400).json({
          success: false,
          message: "User already exist with this phone number",
        });
      }
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Enter a valid email" });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Give a strong password" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (!hashedPassword) {
      return res.json({ success: false, message: "Error in sign up process" });
    }

    const newUser = new User({
      username,
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
      
    });

    const user = await newUser.save();
    if (!user) {
      return res.json({
        success: false,
        message: "Error in creating the user",
      });
    }

    const token = generateToken(user._id,user.role);
    if (!token) {
      return res
        .status(404)
        .json({ success: false, message: "Error in generating token" });
    }

    return res.status(200).json({ success: true, token ,user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        picture: user.picture,
        role: user.role,
      } });

  } catch (error) {
    console.log(error, "Error in sign up");
    return res
      .status(400)
      .json({ success: false, message: "Error in the sign up" });
  }
};

const signin = async (req, res) => {
  const { identifier, password } = req.body || {};
  try {
    const user = await User.findOne({
      $or: [
        { username: identifier },
        { email: identifier },
        { phoneNumber: identifier },
      ],
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not Found!" });
    }

    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credential!" });
    }

    const token = generateToken(user._id,user.role);
    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Error in generating the token" });
    }

    return res.status(200).json({ success: true, token,user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        picture: user.picture,
        role: user.role,
      } });
  } catch (error) {
    console.log(error, "error in sign in");
    return res
      .status(400)
      .json({ success: false, message: "Error in sign in" });
  }
};

const googleSignupLogin = async (req, res) => {
  try {
    const { email, fullName, picture } = req.body;

    if (!email || !fullName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let existedUser = await User.findOne({ email });

    if (existedUser && existedUser.provider === "local") {
      return res.status(400).json({
        message: "This email is already registered using email & password.",
      });
    }

       // If user exists with Google provider, return token
    if (existedUser && existedUser.provider === "google") {
      const token = generateToken(existedUser._id, existedUser.role);

      return res.status(200).json({
          success:true,
        message: "Login successful",
        token,
        user: {
          _id: existedUser._id,
          fullName: existedUser.fullName,
          email: existedUser.email,
          picture: existedUser.picture,
          role: existedUser.role,
        },
      });
    }

  
      const createUser = await User({
        email,
        fullName,
        picture,
        provider: "google",
      });

      const newUser = await createUser.save();
 
      if(!newUser){
         return res.json({
        success: false,
        message: "Error in creating the user",
      });
      } 

    // Create JWT token
    const token = generateToken(newUser._id,newUser.role);

    res.status(200).json({
      success:true,
      message: "Login successful",
      token,
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        picture: newUser.picture,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export { signin, signup, googleSignupLogin};
