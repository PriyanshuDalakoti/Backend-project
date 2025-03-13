import {asyncHandler} from '../utils/asyncHandler.js';
import {apiError} from "../utils/apiError.js"
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { apiResponse } from '../utils/apiResponse.js';


const registerUser=asyncHandler(async(req,res)=>{
    // get user details from frontend
    // validation - not empty
    // check if user already exist - username,email
    // check for images , check for avatar
    // upload them on cloudinary , avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation 
    // return response 

    const {fullname,email,username,password}=req.body
    // console.log("email : ",email);
    // console.log(req.body);
    
    // if (fullname==="") {
    //     throw new apiError(400,"fullName is required");
    // }
    // OR we can also use 

    if ([fullname,email,username,password].some((value)=>value?.trim()==="")) {  //only call the trim() method on value if value is not null or undefined
        throw new apiError(400,"All fields are required");
    }

    //to check if user already exist - username,email
    const existedUser=await User.findOne({
        $or:[{username},{email}]
    })

    if (existedUser) {
        throw new apiError(409,"User with email or username already exist");
    }

    //check for images , check for avatar
    // console.log(req.files)
    const avatarLocalPath=req.files?.avatar[0]?.path; //req.files you get from multer
    // const coverImageLocalPath=req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0) {
        coverImageLocalPath=req.files.coverImage[0].path
    }


    if (!avatarLocalPath) {
        throw new apiError(400,"Avatar file is required");
    }

    //upload them on cloudinary , avatar
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new apiError(400,"Avatar file is required");
    }

    //create user object - create entry in db
    const user=await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    // remove password and refresh token field from response
    const createdUser=await User.findById(user._id).select("-password -refreshToken")

    // check for user creation
    if (!createdUser) {
        throw new apiError(500,"Something went wrong while registering the user");
    }

    // return response 
    //return res.status(201).json({createdUser}) //or we can also do
    return res.status(201).json(
        new apiResponse(200,createdUser,"User Registered Successfully")
    )
})

export {registerUser}