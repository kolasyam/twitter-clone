import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/user.model.js";
import bcrpyt from "bcryptjs";
export const signup=async (req,res)=>{
    try{
        const {fullName,username,email,password}=req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ error: "Invalid email format" });
        }
        const existingUser=await User.findOne({username});
        if(existingUser){
            return res.status(400).json({error:"username is already taken"});
        }
        const existingEmail=await User.findOne({username});
        if(existingEmail){
            return res.status(400).json({error:"Email already exist"});
        }
        if(password.length<6){
            res.status(400).json({error:"password must be at laast  6 character token"})
        }
        const salt= await bcrpyt.genSalt(10);
        const hashedPassword=await bcrpyt.hash(password,salt);
        const newUser=new User({
            fullName,
            username,
            email,
            password:hashedPassword
        })
        if(newUser){
            generateTokenAndSetCookie(newUser._id,res)
            await newUser.save();
            res.status(201).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                username:newUser.username,
                email:newUser.email,
                followers:newUser.followers,
                following:newUser.following,
                coverImg:newUser.coverImg,
            })
        }else{
            res.status(400).json({error:"Invalid user data"})
        }
		
    }catch(error){
        console.log("Error is signup controller",error.message);
    }
};
export const login=async (req,res)=>{
    try{
        const {username,password}=req.body;
        const user=await User.findOne({username});
        const isPasswordCorrect=await bcrpyt.compare(password,user?.password||"");
        if(!user||!isPasswordCorrect){
            return res.status(400).json({error:"Invalid username or password"});
        }
        generateTokenAndSetCookie(user._id,res);
        res.status(200).json({
            _id:user._id,
            fullName:user.fullName,
            username:user.username,
            email:user.email,
            followers:user.followers,
            following:user.following,
            coverImg:user.coverImg,
        });

    }catch(error){
        console.log("Error in login controller",error.message);
        res.status(500).json({error:"Internal Server Error"});
    }
};
export const logout=async (req,res)=>{
    try{
        res.cookie('jwt',"",{maxAge:0})
        res.status(200).json({message:"Logged out successfully"})
    }catch(error){
        console.log("Error in logout controller",error.message);
        res.status(500).json({error:"Internal Server Error"});
    }
};
export const getMe = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select("-password");
		res.status(200).json(user);
	} catch (error) {
		console.log("Error in getMe controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};