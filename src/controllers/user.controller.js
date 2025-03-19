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





const generateAccessAndRefreshTokens=async(userId)=>{ //dont used asynchandler because its just a internal method  and not handling any web request
    try {
        const user=await User.findById(userId)  //user and User are different ,where User can only access database in mongodb and user can access all the methods there
        const accessToken=user.generateAccessToken()  //we give it to user
        const refreshToken=user.generateRefreshToken() //we give it to user and also save it in database so we dont need to ask for password everytime

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false}) //to save refreshToken to database and validateBeforeSave:false because other mongoose field like password kick in

        return {accessToken,refreshToken}

    } catch (error) {
        throw new apiError(500,"Something went wrong while generating access and refresh token")
    }
}

const loginUser=asyncHandler(async(req,res)=>{
    // req body -> data
    // username or email required
    // find the user 
    // check password 
    // access or refresh token 
    // send cookie 

    // req body -> data
    const {email,username,password}=req.body

    // username or email required
    if (!email || !username) {
        throw new apiError(400,"username or password is required")
    }

    // find the user 
    // const user=User.findOne({username})
    const user=User.findOne({   // now the refreshToken is empty and we have select all unwanted fields like password
        $or:[{email},{username}]
    })

    if (!user) {
        throw new apiError(404,"user does not exist")
    }

    // check password 
    const isPasswordValid=await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new apiError(401,"password incorrect")
    }
    
    // access or refresh token 
    const{accessToken,refreshToken}= await generateAccessAndRefreshTokens(user._id)

    const loggedInUser=await User.findById(user._id).select("-password -refreshToken") // now the refresh token in user is not empty and we also de-select fields like password 

    // send cookie
    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options) //we get res.cookie automatically by express
    .cookie("refreshToken",refreshToken,options)
    .json(
        new apiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User Logged In Successfully"
        )
    )

})




const logoutUser=asyncHandler(async(req,res)=>{
    //req.user._id  // you have access of req.user because in user.route.js you have used the middleware verifyJWT which has req.user

    await User.findByIdAndUpdate(   //to delete refreshToken from database because we logout
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true  //return a new updated response where refreshToken:undefined
        }
    )


    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .clearCookie("accessToken",options)  //to remove token from cookie 
    .clearCookie("refreshToken",options)
    .json(new apiResponse(200,{},"User logged Out"))
    
})

export {
    registerUser,
    loginUser,
    logoutUser
}