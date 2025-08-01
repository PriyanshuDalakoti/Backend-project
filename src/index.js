// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connectDB from "./db/db.js";
import {app} from "./app.js"

dotenv.config({
    path: './.env'
})

connectDB()
.then((res)=>{
    app.on("error",(error)=>{
        console.log("Err :",error);
        throw error;
    })

    app.listen(process.env.PORT || 8000 ,()=>{
        console.log(`Server is listing on port : ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MongoDB connection failed !! :",err)
})



/*
import express from "express";
const app=express();


(async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("errror",(error)=>{
            console.log("Err :",error);
            throw error;
        })
         
        app.listen(process.env.PORT, () => {
            console.log(`Example app listening on port ${process.env.PORT}`)
        })
    } catch (error) {
        console.error("Error :",error);
        throw error;
    }
})()

*/