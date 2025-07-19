import mongoose from "mongoose";

const connectDb = async ()=>{
    await mongoose.connect(`${process.env.MONGODB_URI}`).then(console.log("MongoDB connected!")
    )
}

export default connectDb