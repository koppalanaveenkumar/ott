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
const express_1 = __importDefault(require("express"));
const mongoose_1 = require("mongoose");
const body_parser_1 = require("body-parser");
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const config_1 = __importDefault(require("./config"));
const healthcheck_route_1 = __importDefault(require("./routes/healthcheck.route"));
const formData = require('express-form-data');
const user_route_1 = __importDefault(require("./routes/user.route"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_json_1 = __importDefault(require("./swagger.json"));
class App {
    constructor(port) {
        this.app = (0, express_1.default)();
        this.healthcheckRouter = new healthcheck_route_1.default();
        this.userRouter = new user_route_1.default();
        this.bodyParserConfig = () => {
            this.app.use((0, body_parser_1.json)());
            this.app.use((0, body_parser_1.urlencoded)({ extended: false }));
            this.app.use((0, body_parser_1.json)({ limit: '19MB' }));
            this.app.use(formData.parse());
        };
        this.mongooseConfig = () => __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, mongoose_1.connect)(config_1.default.MONGO_URL, { useUnifiedTopology: true });
                console.log('connected to db');
            }
            catch (error) {
                console.log(`mongoErr :::: ${error}`);
            }
        });
        this.initializeRoutes = () => {
            this.app.use('/', this.healthcheckRouter.router);
            this.app.use('/user', this.userRouter.router);
            // Swagger Documentation
            this.app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_json_1.default));
        };
        this.listen = () => {
            this.app.listen(this.port, () => {
                console.log(`Server Running here 👉 http://localhost:${this.port}`);
            });
        };
        this.port = port;
        this.config();
    }
    config() {
        this.app.use((0, cors_1.default)());
        this.bodyParserConfig();
        this.app.use((req, res, next) => {
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
}
exports.default = App;
