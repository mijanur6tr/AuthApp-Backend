import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    username:{
      type:String,
      required:[true,"Username is required"],
      unique:[true,"Username should be unique"]
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required:true,
      unique:true
    },
    password: {
      type: String,
      required:[true,"Enter a password"]
    },
   
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
