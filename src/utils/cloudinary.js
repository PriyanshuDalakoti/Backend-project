import {v2 as cloudinary} from 'cloudinary';
import  fs  from 'fs'; 


const uploadOnCloudinary=async (localFilePath) =>{

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });

    try {
        if(!localFilePath) return null
        // Upload an image
        const uploadResult = await cloudinary.uploader.upload
            (localFilePath, {
                resource_type:'auto',
            })
        //file uploaded succesfully
        console.log("file is uploaded on cloudinary :",uploadResult.url);
        return uploadResult;
        
    } catch (error) {
        fs.unlinkSync(localFilePath)// remove the locally saved temporary file on server as upload got failed (syncronously as it will stop process below it)
        console.log(error);
        return null;
    }
     
};

export {uploadOnCloudinary}