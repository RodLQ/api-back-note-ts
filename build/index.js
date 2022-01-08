"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const noteRoute_1 = __importDefault(require("./routes/noteRoute"));
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.serverHttp = require('http').Server(this.app);
        this.webSocket();
        this.config();
        this.routes();
    }
    config() {
        this.app.set('port', process.env.PORT || 3000);
        this.app.use(express_1.default.json());
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.urlencoded({ extended: false }));
    }
    routes() {
        this.app.use('/api', noteRoute_1.default);
    }
    start() {
        this.serverHttp.listen(this.app.get('port'), () => {
            console.log('Server on port ', this.app.get('port'));
        });
    }
    webSocket() {
        const io = require('socket.io')(this.serverHttp, {
            cors: { origin: "*" }
        });
        io.on('connection', (socket) => {
            console.log(' User conectado, ID: ', socket.id);
            socket.on('modified-note', (data) => {
                console.log(data);
            });
        });
        this.socket = io.on('connection', (socket) => { socket; });
    }
}
const server = new Server();
server.start();
exports.default = server.socket;
