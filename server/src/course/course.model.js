import { Schema, model } from 'mongoose';

const courseSchema = Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        maxLength: [25, "Name cannot exceed 25 characters"],
        unique: true
    },
    description: {
        type: String,
        required: false,
        maxLength: [100, "Description cannot exceed 100 characters"]
    },
    image: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minLength: [6, "Password must be at least 6 characters long"],
    },
    teacher: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    students: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
    },
    degree: {
        type: Schema.Types.ObjectId,
        ref: 'Degree',
        required: true
    },
    document: [{
        fileName: String,
        filePath: String,
        bimester: {
            type: String,
            required: true
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        },
        status: { type: Boolean, default: true }
    }],

    status: {
        type: Boolean,
        default: true
    },

}, {
    versionKey: false,
    timeStamps: true
})

courseSchema.methods.toJSON = function () {
    const { password, _id, ...course } = this.toObject();
    course.cid = _id;
    return course;
};

export default model('Course', courseSchema)