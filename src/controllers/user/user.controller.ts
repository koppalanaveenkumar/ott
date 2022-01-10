import { Request, Response, NextFunction } from 'express';
import UserModel from '../../models/user.model';
import { compare, hash } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import { commonService } from "../../services/common.service";
import { emailSenderService } from "../../services/emailSender.service";
import moment from "moment";
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import config from '../../config';

export default class UserController {

    public createToken = (user: any) => {
        const expiresIn = 43200000;
        const dataStoredToken = {
            _id: user._id,
            time: user["lastLogginIn"]
        }
        return sign(dataStoredToken, config.USER_JWT_SECRET, { expiresIn })
    }
    lastLoggedIn: any;
    public createUser = async (req: Request, res: Response) => {
        try {
            const emailMatched = await UserModel.findOne({ email: req.body.email });
            console.log("Email", emailMatched);
            if (emailMatched) {
                res.status(409).json({ email: true });
            } else {
                const phoneMatched = await UserModel.findOne({ phone: req.body.phone });
                if (phoneMatched) {
                    res.status(409).json({ phone: true });
                } else {
                    const hashedPassword = await hash(req.body.password, 10);
                    const requestBody = {
                        ...req.body,
                        password: hashedPassword,
                        lastLoggedIn: moment().unix(),
                        lastUpdatedAt: Date.now()
                    };
                    const user: any = await UserModel.create(requestBody);
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
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    };


    public authenticate = async (req: Request, res: Response) => {
        try {
            const emailMatched: any = await UserModel.findOne({
                email: req.body.email,
            });
            if (emailMatched) {
                const comparePassword = await compare(
                    req.body.password,
                    emailMatched["password"]
                );
                if (comparePassword) {
                    const updateTimesstamp: any = await UserModel.findOneAndUpdate(
                        { _id: emailMatched["_id"] },
                        { $set: { lastLoggedIn: moment().unix() } },
                        { new: true }
                    );
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
                } else {
                    res.status(409).json({ password: true });
                }
            } else {
                res.status(409).json({ email: true });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    };

    public sendEmail = async (req: Request, res: Response) => {
        try {
            const user = await UserModel.findOne({ email: req.body.email });
            console.log("user", user)
            if (user) {
                const token = await commonService.generateRandomBytes();
                console.log("token", token)
                const updateUser: any = await UserModel.findByIdAndUpdate(
                    { _id: user["_id"] },
                    {
                        resetPasswordToken: token,
                        resetPasswordExpires: Date.now() + 3000000,
                    },
                    { upsert: true, new: true },
                );
                console.log("updateUser", updateUser)
                if (updateUser) {
                    updateUser.type = "resetPassword";
                    await emailSenderService.sendEmail(updateUser, token);
                    res.status(200).json({ status: 1, data: { message: "Sent Successfully" } });
                } else {
                    res.status(409).json({ status: 0, data: { message: "Failed in sending email, Try again" } });
                }
            } else {
                res.status(401).json({ status: 0, data: { message: "Email not found" } })
            }
        } catch (err) {
            res.status(500).send(err);
        }
    }

    public resetPassword = async (req: Request, res: Response) => {
        try {
            const user: any = await UserModel.findOne({
                resetPasswordToken: req.body.token,
                resetPasswordExpires: { $gt: Date.now() }
            });
            if (user) {
                const hashedPassword = await bcrypt.hashSync(req.body.newPassword, 10);
                if (hashedPassword) {
                    const updatedUser = await UserModel.findByIdAndUpdate(
                        { _id: user["_id"] },
                        {
                            $set: {
                                password: hashedPassword,
                                resetPasswordToken: undefined,
                                resetPasswordExpires: undefined,
                            },
                        },
                        { upsert: true, new: true }
                    );
                    if (updatedUser) {
                        res.status(200).json({
                            status: 1, data: { message: "Password updated successfully" }
                        })
                    } else {
                    }
                }
            } else {
                res.status(409).json({
                    status: 0,
                    data: {
                        errorDescription: "Password reset token is invalid or has expired.",
                        error: "expired_token",
                    }
                })
            }
        } catch (error) {
            res.status(500).json(error);
        }
    }

    public changePassword = async (req: any, res: Response) => {
        try {
            const user: any = await UserModel.findById(req['tokenId']);
            if (user) {
                if (bcrypt.compareSync(req.body.currentPassword, user.password)) {
                    let updateUser = await UserModel.updateOne({ _id: req['tokenId'] }, { $set: { password: bcrypt.hashSync(req.body.newPassword, 10) } }, { new: true });
                    if (updateUser) {
                        res.status(200).json("Password updated Successfully")
                    } else {
                        res.status(401).json({ status: "Failed in update password" })
                    }
                } else {
                    res.status(401).json({ currentPassword: true });
                }
            } else {
                res.status(409).json({ username: true })
            }
        } catch (err) {
            res.status(500).json(err);
        }
    }


}
