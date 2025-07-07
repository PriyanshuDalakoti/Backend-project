import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema=new Schema({
    content:{
        type:String,
        required:true
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
},{timestamps:true})

commentSchema.plugin(mongooseAggregatePaginate)  //plugin provide the ability to control paginate to decide how many videos need to given to user

export const Comment=mongoose.model("Comment",commentSchema) 