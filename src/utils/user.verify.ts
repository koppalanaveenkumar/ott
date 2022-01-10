import { verify, decode } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import config from '../config';
import userModel from '../models/user.model';


const userScret = async (req: any, res: Response, next: NextFunction) => {
    try {
        const reqToken: any = req.headers && req.headers.authorization || '';
        const token = reqToken.split(' ');
        if (token && token.length === 2) {
            const matchToken = token[1];
            const verified = verify(matchToken, config.USER_JWT_SECRET);
            if (verified) {
                if (token) {
                    const decoded: any = decode(matchToken);
                    if (decoded) {
                        try {
                            const adminDetails: any = await userModel.findOne({ _id: decoded._id, isActive: true });
                            if (adminDetails) {
                                req['tokenId'] = decoded._id;
                                next();
                            } else {
                                res.status(401).json({ adminDetails: true })
                            }
                        } catch (err) {
                            res.status(500).json({ decoded: false })
                        }
                    }
                }
            }
        } else {
            res.status(403).json({ token: "Required" });
        }
    } catch (err) {
        res.status(403).json({ token: true, err });
    }
}

export default userScret;