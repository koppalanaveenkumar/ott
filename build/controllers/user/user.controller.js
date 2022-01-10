"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../../models/user.model"));
const bcryptjs_1 = require("bcryptjs");
const jsonwebtoken_1 = require("jsonwebtoken");
const common_service_1 = require("../../services/common.service");
const emailSender_service_1 = require("../../services/emailSender.service");
const moment_1 = __importDefault(require("moment"));
const bcryptjs_2 = __importDefault(require("bcryptjs"));
require("dotenv/config");
const config_1 = __importDefault(require("../../config"));
class UserController {
    constructor() {
        this.createToken = (user) => {
            const expiresIn = 43200000;
            const dataStoredToken = {
                _id: user._id,
                time: user["lastLogginIn"]
            };
            return (0, jsonwebtoken_1.sign)(dataStoredToken, config_1.default.USER_JWT_SECRET, { expiresIn });
        };
        this.createUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const emailMatched = yield user_model_1.default.findOne({ email: req.body.email });
                console.log("Email", emailMatched);
                if (emailMatched) {
                    res.status(409).json({ email: true });
                }
                else {
                    const phoneMatched = yield user_model_1.default.findOne({ phone: req.body.phone });
                    if (phoneMatched) {
                        res.status(409).json({ phone: true });
                    }
                    else {
                        const hashedPassword = yield (0, bcryptjs_1.hash)(req.body.password, 10);
                        const requestBody = Object.assign(Object.assign({}, req.body), { password: hashedPassword, lastLoggedIn: (0, moment_1.default)().unix(), lastUpdatedAt: Date.now() });
                        const user = yield user_model_1.default.create(requestBody);
                        if (user) {
                            const tokenData = this.createToken(user);
                            res.status(201).json({
                                auth: true,
                                token: tokenData,
                                username: user["firstname"],
                            });
                        }
                    }
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.authenticate = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const emailMatched = yield user_model_1.default.findOne({
                    email: req.body.email,
                });
                if (emailMatched) {
                    const comparePassword = yield (0, bcryptjs_1.compare)(req.body.password, emailMatched["password"]);
                    if (comparePassword) {
                        const updateTimesstamp = yield user_model_1.default.findOneAndUpdate({ _id: emailMatched["_id"] }, { $set: { lastLoggedIn: (0, moment_1.default)().unix() } }, { new: true });
                        if (updateTimesstamp) {
                            const tokenData = this.createToken(updateTimesstamp);
                            res.status(200).json({
                                auth: true,
                                token: tokenData,
                                username: emailMatched["username"],
                                isActive: updateTimesstamp["isActive"],
                                isUser: emailMatched["isUser"]
                            });
                        }
                    }
                    else {
                        res.status(409).json({ password: true });
                    }
                }
                else {
                    res.status(409).json({ email: true });
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.sendEmail = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_model_1.default.findOne({ email: req.body.email });
                console.log("user", user);
                if (user) {
                    const token = yield common_service_1.commonService.generateRandomBytes();
                    console.log("token", token);
                    const updateUser = yield user_model_1.default.findByIdAndUpdate({ _id: user["_id"] }, {
                        resetPasswordToken: token,
                        resetPasswordExpires: Date.now() + 3000000,
                    }, { upsert: true, new: true });
                    console.log("updateUser", updateUser);
                    if (updateUser) {
                        updateUser.type = "resetPassword";
                        yield emailSender_service_1.emailSenderService.sendEmail(updateUser, token);
                        res.status(200).json({ status: 1, data: { message: "Sent Successfully" } });
                    }
                    else {
                        res.status(409).json({ status: 0, data: { message: "Failed in sending email, Try again" } });
                    }
                }
                else {
                    res.status(401).json({ status: 0, data: { message: "Email not found" } });
                }
            }
            catch (err) {
                res.status(500).send(err);
            }
        });
        this.resetPassword = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_model_1.default.findOne({
                    resetPasswordToken: req.body.token,
                    resetPasswordExpires: { $gt: Date.now() }
                });
                if (user) {
                    const hashedPassword = yield bcryptjs_2.default.hashSync(req.body.newPassword, 10);
                    if (hashedPassword) {
                        const updatedUser = yield user_model_1.default.findByIdAndUpdate({ _id: user["_id"] }, {
                            $set: {
                                password: hashedPassword,
                                resetPasswordToken: undefined,
                                resetPasswordExpires: undefined,
                            },
                        }, { upsert: true, new: true });
                        if (updatedUser) {
                            res.status(200).json({
                                status: 1, data: { message: "Password updated successfully" }
                            });
                        }
                        else {
                        }
                    }
                }
                else {
                    res.status(409).json({
                        status: 0,
                        data: {
                            errorDescription: "Password reset token is invalid or has expired.",
                            error: "expired_token",
                        }
                    });
                }
            }
            catch (error) {
                res.status(500).json(error);
            }
        });
        this.changePassword = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_model_1.default.findById(req['tokenId']);
                if (user) {
                    if (bcryptjs_2.default.compareSync(req.body.currentPassword, user.password)) {
                        let updateUser = yield user_model_1.default.updateOne({ _id: req['tokenId'] }, { $set: { password: bcryptjs_2.default.hashSync(req.body.newPassword, 10) } }, { new: true });
                        if (updateUser) {
                            res.status(200).json("Password updated Successfully");
                        }
                        else {
                            res.status(401).json({ status: "Failed in update password" });
                        }
                    }
                    else {
                        res.status(401).json({ currentPassword: true });
                    }
                }
                else {
                    res.status(409).json({ username: true });
                }
            }
            catch (err) {
                res.status(500).json(err);
            }
        });
    }
}
exports.default = UserController;
