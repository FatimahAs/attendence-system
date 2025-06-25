import { Schema, Document, model, models} from 'mongoose'

export interface ParticipantDocument extends Document {
    id: string,
    classId: string,
    userId:  String,
    role:  'teacher' | 'student';
}

const ParticipantSchema = new Schema<ParticipantDocument> ({
    id: {type: String},
    classId:{type: String},
    userId: {type: String},
    role: { type: String, enum: ['teacher', 'student'], required: true }
},
{timestamps: true})

const ParticipantModel = models.Participant || model<ParticipantDocument>('Participant', ParticipantSchema);
export default ParticipantModel