import {Router} from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
 
const router=Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {   
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)


router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)  //verifyJWT to make sure user is logged in then only he can have those token
router.route("/refresh-token").post(refreshAccessToken)

export default router