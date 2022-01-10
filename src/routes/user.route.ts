import { Router } from 'express';
import verifyToken from '../utils/user.verify';
import UserController from '../controllers/user/user.controller';



export default class UserRouter {
    public router: Router = Router();
    private userController: UserController = new UserController();

    constructor() {
        this.initializeRoutes();
    }
    private initializeRoutes(): void {
        this.router.post('/createUser', this.userController.createUser);
        this.router.post('/authenticate', this.userController.authenticate);
        this.router.post('/sendEmail', this.userController.sendEmail);
        this.router.post('/resetPassword', this.userController.resetPassword);
        this.router.post('/changePassword', verifyToken, this.userController.changePassword);
    }
}