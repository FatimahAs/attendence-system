import { Schema, Document, model} from 'mongoose'

export interface ClassDocument extends Document {
    id: string,
    name: string,
    location:  String,
    capacity:  Number,
    startAt: String,
    endAt:String
}

const ClassSchema = new Schema<ClassDocument> ({
    id: {type: String},
    name:{type: String},
    location: {type: String},
    capacity: {type: Number},
    startAt: {type: String},
    endAt: {type: String}
},
{timestamps: true})

 const ClassModel = model <ClassDocument>('Class', ClassSchema)
export default ClassModel