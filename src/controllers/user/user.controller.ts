import { Request, Response, NextFunction } from 'express';
import UserModel from '../../models/user.model';
import { compare, hash } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { Types } from "mongoose";
import moment from "moment";
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
}
