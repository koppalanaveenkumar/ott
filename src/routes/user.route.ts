import { Router } from 'express';
// import { verifyToken } from '../utils/verify';
import UserController from '../controllers/user/user.controller';



export default class UserRouter {
    public router: Router = Router();
    private userController: UserController = new UserController();

    constructor() {
        this.initializeRoutes();
    }
    private initializeRoutes(): void {
        this.router.post('/createUser', this.userController.createUser);
        this.router.post('/authenticate', this.userController.authenticate)
    }
}