"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_verify_1 = __importDefault(require("../utils/user.verify"));
const user_controller_1 = __importDefault(require("../controllers/user/user.controller"));
class UserRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.userController = new user_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post('/createUser', this.userController.createUser);
        this.router.post('/authenticate', this.userController.authenticate);
        this.router.post('/sendEmail', this.userController.sendEmail);
        this.router.post('/resetPassword', this.userController.resetPassword);
        this.router.post('/changePassword', user_verify_1.default, this.userController.changePassword);
    }
}
exports.default = UserRouter;
