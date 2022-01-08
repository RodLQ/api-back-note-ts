"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const noteController_1 = __importDefault(require("../controllers/noteController"));
class NoteRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        //No TOKEN
        this.router.post('/login', noteController_1.default.loginUser);
        this.router.post('/registration/user', noteController_1.default.registrationUser);
        //WHITH TOKEN
        this.router.get('/list/user', this.verifyToken, noteController_1.default.listUser);
        this.router.get('/list/note', this.verifyToken, noteController_1.default.listNote);
        this.router.get('/get/note/:cod', this.verifyToken, noteController_1.default.getNote);
        this.router.post('/registration/note', this.verifyToken, noteController_1.default.registrationNote);
        this.router.put('/update/note/:cod', this.verifyToken, noteController_1.default.updateNote);
        this.router.put('/update/user/:cod', this.verifyToken, noteController_1.default.updateUser);
        this.router.delete('/delete/note/:cod', this.verifyToken, noteController_1.default.deleteNote);
        //LIMIT
        this.router.get('/list/note/rank/:min&:max', this.verifyToken, noteController_1.default.listNoteMinMax);
    }
    verifyToken(req, res, next) {
        const bearerHeader = req.headers['authorization'];
        if (typeof bearerHeader !== 'undefined') {
            const bearerToken = bearerHeader.split(" ")[1];
            req.token = bearerToken;
            next();
        }
        else {
            res.sendStatus(403);
        }
    }
}
const noteRoute = new NoteRoute();
exports.default = noteRoute.router;
