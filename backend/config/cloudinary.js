import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

const uploadOnCloudinary =async(imageUrl)=>{
    cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

    try {
        if(!imageUrl){
            return null
        }
        const uploadResult = await cloudinary.uploader.upload(imageUrl) 
        return uploadResult.secure_url

    } catch (error) {
        console.log("Cloudinary error:", error);
    }
}

export default uploadOnCloudinary