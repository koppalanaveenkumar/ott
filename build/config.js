"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
exports.default = Object.freeze({
    MONGO_URL: "mongodb+srv://naveen:naveen@cluster0.tflnq.mongodb.net/OTT?retryWrites=true&w=majority",
    USER_JWT_SECRET: 'ottbackend',
    FRONT_END_URL: 'https://localhost:3000'
});
