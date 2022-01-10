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
const database_1 = __importDefault(require("../database"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const index_1 = __importDefault(require("../index"));
class NoteController {
    //!LOGIN USER
    loginUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            database_1.default.query('SELECT * FROM user WHERE nickname = ?', req.body.nickname, function (err, result) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (err) {
                        throw err;
                    }
                    if (result.length > 0) {
                        let compare = bcrypt_1.default.compareSync(req.body.password, result[0].password);
                        if (compare) {
                            jsonwebtoken_1.default.sign({ user: result }, 'keyCodeToken', (err, token) => {
                                res.json({ token: token });
                            });
                        }
                        else {
                            res.json({ message: 'Incorrect password' });
                        }
                    }
                    else {
                        res.json({ message: 'Unregistered user' });
                    }
                });
            });
        });
    }
    //!REGISTRATION USER
    registrationUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let nick = req.body.nickname;
            database_1.default.query('SELECT * FROM user WHERE nickname = ? ', nick, function (err, result, fields) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (err) {
                        throw err;
                    }
                    if (result.length > 0) {
                        res.json({ message: "registered nickname" });
                    }
                    else {
                        let dni = req.body.dni;
                        database_1.default.query('SELECT * FROM user WHERE dni = ? ', dni, function (err, result, fields) {
                            return __awaiter(this, void 0, void 0, function* () {
                                if (err) {
                                    throw err;
                                }
                                if (result.length > 0) {
                                    res.json({ message: "registered DNI" });
                                }
                                else {
                                    let passEncrypts = yield bcrypt_1.default.hash(req.body.password, 8);
                                    req.body.password = passEncrypts;
                                    database_1.default.query('INSERT INTO user set ?', [req.body], (err, result) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                        if (result.affectedRows > 0) {
                                            res.json({ message: " Registered User -:)",
                                                colAfect: result });
                                        }
                                        else {
                                            res.json({ message: "not registered user - col unaffected " });
                                        }
                                    });
                                }
                            });
                        });
                    }
                });
            });
        });
    }
    //!USER LIST
    listUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            jsonwebtoken_1.default.verify(req.token, 'keyCodeToken', (err, authData) => {
                if (err) {
                    res.sendStatus(403);
                }
                else {
                    database_1.default.query('SELECT * FROM user', function (err, result) {
                        if (err) {
                            throw err;
                        }
                        res.json({ result: result, Data: authData.user[0] });
                    });
                }
            });
        });
    }
    //!NOTE LIST
    listNote(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            jsonwebtoken_1.default.verify(req.token, 'keyCodeToken', (err, authData) => {
                if (err) {
                    res.sendStatus(403);
                }
                else {
                    database_1.default.query('SELECT * FROM note WHERE cod_user = ? ', authData.user[0].cod, function (err, result) {
                        if (err) {
                            throw err;
                        }
                        res.json({ result: result, user: authData.user[0] });
                    });
                }
            });
        });
    }
    //!REGISTRATION NOTE
    registrationNote(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            jsonwebtoken_1.default.verify(req.token, 'keyCodeToken', (err, authData) => {
                if (err) {
                    res.sendStatus(403);
                }
                else {
                    req.body.cod_user = authData.user[0].cod;
                    database_1.default.query('INSERT INTO note set ?', [req.body], (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                        if (result.affectedRows > 0) {
                            res.json({ message: " Registered Note -:)",
                                colAfect: result });
                            index_1.default.emit('modified-note', true);
                        }
                        else {
                            res.json({ message: "not registered note - col unaffected " });
                        }
                    });
                }
            });
        });
    }
    //!UPDATE NOTE
    updateNote(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            jsonwebtoken_1.default.verify(req.token, 'keyCodeToken', (err, authData) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    res.sendStatus(403);
                }
                else {
                    database_1.default.query('UPDATE note set ? WHERE cod_note = ?', [req.body, req.params.cod], function (err, result) {
                        if (err) {
                            console.log(err);
                        } //Columnas afectadas
                        if (result.affectedRows > 0) {
                            res.json({ message: "the note was modified ",
                                colAfect: result.affectedRows });
                            index_1.default.emit('modified-note', true);
                        }
                        else {
                            res.json({ message: "not modified - col unaffected " });
                        }
                    });
                }
            }));
        });
    }
    //!UPDATE USER
    updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            jsonwebtoken_1.default.verify(req.token, 'keyCodeToken', (err, authData) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    res.sendStatus(403);
                }
                else {
                    //res.json(authData);
                    let nick = req.body.nickname;
                    database_1.default.query('SELECT * FROM user WHERE nickname = ? ', nick, function (err, result, fields) {
                        return __awaiter(this, void 0, void 0, function* () {
                            if (err) {
                                throw err;
                            }
                            if ((result.length > 0) && (authData.user[0].cod != result[0].cod)) {
                                res.json({ message: "registered nickname" });
                            }
                            else {
                                database_1.default.query('UPDATE user set ? WHERE cod = ?', [req.body, authData.user[0].cod], function (err, result) {
                                    if (err) {
                                        throw err;
                                    } //Columnas afectadas
                                    if (result.affectedRows > 0) {
                                        res.json({ message: "the user was modified ",
                                            colAfect: result.affectedRows });
                                    }
                                    else {
                                        res.json({ message: "not modified - col unaffected" });
                                    }
                                });
                            }
                        });
                    });
                }
            }));
        });
    }
    //!DELETE NOTE
    deleteNote(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            jsonwebtoken_1.default.verify(req.token, 'keyCodeToken', (err, authData) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    res.sendStatus(403);
                }
                else {
                    database_1.default.query('DELETE FROM note WHERE cod_note = ?', [req.params.cod], function (err, result) {
                        if (err) {
                            throw err;
                        } //Columnas afectadas
                        if (result.affectedRows > 0) {
                            res.json({ message: "the note was delete ",
                                colAfect: result.affectedRows });
                            index_1.default.emit('modified-note', 'true');
                        }
                        else {
                            res.json({ message: "not delete - col unaffected " });
                        }
                    });
                }
            }));
        });
    }
    //!GET ONE NOTE
    getNote(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            jsonwebtoken_1.default.verify(req.token, 'keyCodeToken', (err, authData) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    res.sendStatus(403);
                }
                else {
                    //res.json({message: req.params.cod, text: "Obtener datos" });
                    database_1.default.query('SELECT * FROM note WHERE cod_note = ? ', req.params.cod, function (err, result, fields) {
                        return __awaiter(this, void 0, void 0, function* () {
                            if (err) {
                                throw err;
                            }
                            if (result.length > 0) {
                                res.json({ result: result });
                            }
                            else {
                                res.json({ message: "Cod note not found" });
                            }
                        });
                    });
                }
            }));
        });
    }
    //!NOTE LIST MIN and MAX-
    listNoteMinMax(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            jsonwebtoken_1.default.verify(req.token, 'keyCodeToken', (err, authData) => {
                if (err) {
                    res.sendStatus(403);
                }
                else {
                    let min = req.params.min;
                    let max = req.params.max;
                    let consulta = "SELECT * FROM note WHERE cod_user = " + authData.user[0].cod + " LIMIT " + min + "," + max;
                    database_1.default.query(consulta, function (err, result) {
                        if (err) {
                            throw err;
                        }
                        res.json({ result: result });
                    });
                }
            });
        });
    }
    //!GET DATA USER IN TOKEN
    getUserOfToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            jsonwebtoken_1.default.verify(req.token, 'keyCodeToken', (err, authData) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    res.sendStatus(403);
                }
                else {
                    //res.json({cod:authData});
                    //res.json({message: req.params.cod, text: "Obtener datos" });
                    database_1.default.query('SELECT * FROM user WHERE cod = ? ', authData.user[0].cod, function (err, result, fields) {
                        return __awaiter(this, void 0, void 0, function* () {
                            if (err) {
                                throw err;
                            }
                            if (result.length > 0) {
                                res.json({ result: result });
                            }
                            else {
                                res.json({ message: "Cod User not found" });
                            }
                        });
                    });
                }
            }));
        });
    }
}
const noteController = new NoteController();
exports.default = noteController;
