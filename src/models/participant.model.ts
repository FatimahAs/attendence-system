import { Schema, Document, model} from 'mongoose'

export interface ClassDocument extends Document {
    id: string,
    classId: string,
    userId:  String,
}

const ClassSchema = new Schema<ClassDocument> ({
    id: {type: String},
    classId:{type: String},
    userId: {type: String},
},
{timestamps: true})

 const ClassModel = model <ClassDocument>('Class', ClassSchema)
export default ClassModel