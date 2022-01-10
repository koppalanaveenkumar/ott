"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    username: {
        type: mongoose_1.Schema.Types.String,
        required: 'User is required',
    },
    email: {
        type: mongoose_1.Schema.Types.String,
        required: 'Email is required'
    },
    phone: {
        type: mongoose_1.Schema.Types.String,
        required: 'Phone number is required'
    },
    password: {
        type: mongoose_1.Schema.Types.String,
        required: 'Password is required'
    },
    lastLoggedIn: {
        type: mongoose_1.Schema.Types.String,
    },
    resetPasswordToken: {
        type: mongoose_1.Schema.Types.String
    },
    resetPasswordExpires: {
        type: mongoose_1.Schema.Types.String
    },
    createdAt: {
        type: mongoose_1.Schema.Types.Date,
        default: new Date()
    },
    isUser: {
        type: mongoose_1.Schema.Types.Boolean,
        default: true
    },
    isActive: {
        type: mongoose_1.Schema.Types.Boolean,
        default: true
    },
    lastUpdatedAt: {
        type: mongoose_1.Schema.Types.Number,
        default: Date.now()
    }
});
exports.default = (0, mongoose_1.model)('user', userSchema);
