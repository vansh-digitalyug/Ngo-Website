import mongoose from "mongoose";
const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true   
    },
    description:{
        type:String,
        trim:true,
        default:""
    },
    imageUrl:{  
        type:String,
        default:null
    },
    isActive:{
        type:Boolean,
        default:true
    }
}, {timestamps:true});

categorySchema.index({ name: 1 }, { unique: true });

const Category = mongoose.model("Category", categorySchema);

export default Category;
