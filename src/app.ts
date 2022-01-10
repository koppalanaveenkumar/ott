import express from 'express';
import { connect } from 'mongoose';
import { json, urlencoded } from 'body-parser';
import cors from 'cors';
import 'dotenv/config';
import config from './config';
import HealthCheckRouter from './routes/healthcheck.route'
const formData = require('express-form-data');
import UserRouter from './routes/user.route';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json'

export default class App {
    public app: express.Application = express();
    public port: number;

    private healthcheckRouter: HealthCheckRouter = new HealthCheckRouter();
    private userRouter: UserRouter = new UserRouter();
    constructor(port: number) {
        this.port = port;
        this.config();
    }

    private config() {
        this.app.use(cors());
        this.bodyParserConfig();
        this.app.use((req: any, res: any, next: any) => {
            // res.header("Access-Control-Allow-Origin", "*");
            // res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, PATCH, OPTIONS');
            // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
            res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.header('Pragma', 'no-cache');
            res.header('Expires', '0');
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Content-type, Accept');
            next();
        });
        this.mongooseConfig();
        this.initializeRoutes();
    }

    private bodyParserConfig = () => {
        this.app.use(json());
        this.app.use(urlencoded({ extended: false }));
        this.app.use(json({ limit: '19MB' }));
        this.app.use(formData.parse());

    }

    private mongooseConfig = async () => {
        try {
            await connect(config.MONGO_URL, { useUnifiedTopology: true });
            console.log('connected to db');
        } catch (error) {
            console.log(`mongoErr :::: ${error}`);
        }
    }

    private initializeRoutes = () => {
        this.app.use('/', this.healthcheckRouter.router);
        this.app.use('/user', this.userRouter.router);

        // Swagger Documentation
        this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    }

    public listen = () => {
        this.app.listen(this.port, () => {
            console.log(`Server Running here 👉 http://localhost:${this.port}`);
        });
    }
}
