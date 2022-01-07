import { Schema, model } from "mongoose";

const userSchema = new Schema({
    username: {
        type: Schema.Types.String,
        required: 'User is required',
    },
    email: {
        type: Schema.Types.String,
        required: 'Email is required'
    },
    phone: {
        type: Schema.Types.String,
        required: 'Phone number is required'
    },
    password: {
        type: Schema.Types.String,
        required: 'Password is required'
    },
    lastLoggedIn: {
        type: Schema.Types.String,
    },
    resetPasswordToken: {
        type: Schema.Types.String
    },
    resetPasswordExpires: {
        type: Schema.Types.String
    },
    createdAt: {
        type: Schema.Types.Date,
        default: new Date()
    },
    isUser: {
        type: Schema.Types.Boolean,
        default: true
    },
    isActive: {
        type: Schema.Types.Boolean,
        default: true
    },
    lastUpdatedAt: {
        type: Schema.Types.Number,
        default: Date.now()
    }
});

export default model('user', userSchema);