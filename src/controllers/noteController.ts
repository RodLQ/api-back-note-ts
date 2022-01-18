import { Request, Response } from 'express';
import pool from '../database';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import server from '../index';

class NoteController{
    //!LOGIN USER
    public async loginUser(req:Request,res:Response){

        pool.query('SELECT * FROM user WHERE nickname = ?', req.body.nickname, async function(err,result){
            if(err){
                throw err;
            }
            if(result.length > 0){
                let compare = bcrypt.compareSync( req.body.password ,result[0].password);
                if(compare){
                    jwt.sign( {user:result},'keyCodeToken', (err:any,token:any)=>{
                        res.json({token:token});
                    } );
                }
                else{
                    res.json({ message: 'Incorrect password' });
                }
            }
            else{
                res.json( { message: 'Unregistered user' } );
            }
        } );   
    }
    //!REGISTRATION USER
    public async registrationUser(req:any,res:Response){

        let nick  = req.body.nickname;
        pool.query('SELECT * FROM user WHERE nickname = ? ', nick, async function (err, result, fields) {
            if (err) {
                throw err;
            }
            if (result.length > 0) {
                res.json( { message:"registered nickname" } );
            }
            else {
                let dni = req.body.dni;
                pool.query('SELECT * FROM user WHERE dni = ? ', dni, async function (err, result, fields) {
                    if (err) {
                        throw err;
                    }
                    if (result.length > 0) {
                        res.json( { message:"registered DNI" } );
                    }
                    else {
                        let passEncrypts = await bcrypt.hash( req.body.password , 8 );
                        req.body.password = passEncrypts;
        
                        pool.query('INSERT INTO user set ?', [req.body],(err, result)=>{
                            if(err){
                                console.log(err);
                            }
                            if(result.affectedRows>0){
                                res.json({ message:" Registered User -:)",
                                colAfect: result});
                            }
                            else{
                                res.json({ message:"not registered user - col unaffected "});
                            }
                        });
                    }
                });
            }
        });       
    }
    //!USER LIST
    public async listUser(req:any,res:Response){

        jwt.verify(req.token, 'keyCodeToken', (err: any, authData: any)=>{
            if(err){
                res.sendStatus(403);
            }
            else{
                pool.query('SELECT * FROM user', function(err,result){
                    if(err){
                        throw err;
                    }
                    res.json({result:result ,Data: authData.user[0] });

                });
            }
        });
    }
    //!NOTE LIST
    public async listNote(req:any,res:Response){

        jwt.verify(req.token, 'keyCodeToken', (err: any, authData: any)=>{
            if(err){
                res.sendStatus(403);
            }
            else{
                pool.query('SELECT * FROM note WHERE cod_user = ? ', authData.user[0].cod , function(err,result){
                    if(err){
                        throw err;
                    }
                    res.json({result:result , user: authData.user[0] });

                });
            }
        });
    }
    //!REGISTRATION NOTE
    public async registrationNote(req:any,res:Response){

        jwt.verify(req.token, 'keyCodeToken', (err: any, authData: any)=>{
            if(err){
                res.sendStatus(403);
            }
            else{
                req.body.cod_user = authData.user[0].cod;
                pool.query('INSERT INTO note set ?', [req.body], (err, result)=>{
                    if(err){
                        console.log(err);
                    }
                    if(result.affectedRows>0){
                        res.json({ message:" Registered Note -:)",
                        colAfect: result});
                        //server.socket.emit( 'modified-note' , true );

                        //? EMITIR A LA SALA DEL COD
                        server.io.to(authData.user[0].cod).emit('event-room', true);
                    }
                    else{
                        res.json({ message:"not registered note - col unaffected "});
                    }
                });
            }
        });       
    }
    //!UPDATE NOTE
    public async updateNote(req:any,res:Response){

        jwt.verify(req.token, 'keyCodeToken', async (err: any, authData: any)=>{
            if(err){
                res.sendStatus(403);
            }
            else{
                pool.query('UPDATE note set ? WHERE cod_note = ?',
                    [req.body, req.params.cod] , function(err, result){
                        if(err){
                            console.log(err);
                        }//Columnas afectadas
                        if(result.affectedRows>0){
                            res.json({ message:"the note was modified ",
                            colAfect: result.affectedRows });
                            //server.socket.emit( 'modified-note' , true );
                            
                            //? EMITIR A LA SALA DEL COD
                            server.io.to(authData.user[0].cod).emit('event-room', true);
                            
                        }
                        else{
                            res.json({ message:"not modified - col unaffected "});
                        }
                    } 
                );
            }
        });
    }
    //!UPDATE USER
    public async updateUser(req:any,res:Response){

        jwt.verify(req.token, 'keyCodeToken', async (err: any, authData: any)=>{
            if(err){
                res.sendStatus(403);
            }
            else{
                //res.json(authData);
                let nick  = req.body.nickname;
                pool.query('SELECT * FROM user WHERE nickname = ? ', nick, async function (err, result, fields) {
                    if (err) {
                        throw err;
                    }
                    if ( (result.length > 0) && (authData.user[0].cod != result[0].cod) ) {

                        res.json( { message:"registered nickname"} );
                    }
                    else {
                        pool.query('UPDATE user set ? WHERE cod = ?',
                            [req.body, authData.user[0].cod] , function(err, result){
                                if(err){
                                    throw err;
                                }//Columnas afectadas
                                if(result.affectedRows>0){
                                    res.json({ message:"the user was modified ",
                                    colAfect: result.affectedRows });
                                    server.io.to(authData.user[0].cod).emit('event-user', true);
                                }
                                else{
                                    res.json({ message:"not modified - col unaffected"});
                                }
                            } 
                        );
                    }
                });
            }
        });
    }
    //!DELETE NOTE
    public async deleteNote(req:any,res:Response){
        
        jwt.verify(req.token, 'keyCodeToken', async (err: any, authData: any)=>{
            if(err){
                res.sendStatus(403);
            }
            else{
                pool.query('DELETE FROM note WHERE cod_note = ?', [req.params.cod] , 
                    function(err, result){
                        if(err){
                            throw err;
                        }//Columnas afectadas
                        if(result.affectedRows>0){
                            res.json({ message:"the note was delete ",
                            colAfect: result.affectedRows });
                            //server.socket.emit( 'modified-note' , 'true' );
                            //? EMITIR A LA SALA DEL COD
                            server.io.to(authData.user[0].cod).emit('event-room', true);
                        }
                        else{
                            res.json({ message:"not delete - col unaffected "});
                        }
                    } 
                );
            }
        });
        
    }
    //!GET ONE NOTE
    public async getNote(req:any,res:Response){
        
        jwt.verify(req.token, 'keyCodeToken', async (err: any, authData: any)=>{
            if(err){
                res.sendStatus(403);
            }
            else{
                pool.query('SELECT * FROM note WHERE cod_note = ? ', req.params.cod , async function (err, result, fields) {
                    if (err) {
                        throw err;
                    }
                    if (result.length > 0) {
                        res.json( { result: result } );
                    }
                    else{
                        res.json({ message:"Cod note not found"});
                    }
                });
            }
        });    
    }
    //!NOTE LIST MIN and MAX-
    public async listNoteMinMax(req:any,res:Response){

        jwt.verify(req.token, 'keyCodeToken', (err: any, authData: any)=>{
            if(err){
                res.sendStatus(403);
            }
            else{
                let min = req.params.min; let max = req.params.max;
                let consulta = "SELECT * FROM note WHERE cod_user = "+authData.user[0].cod +" LIMIT "+min+","+max;
                pool.query( consulta , function(err,result){
                    if(err){
                        throw err;
                    }
                    res.json( {result:result} );

                });
            }
        });
    }
    //!GET DATA USER IN TOKEN
    public async getUserOfToken( req:any,res:Response ){

        jwt.verify(req.token, 'keyCodeToken', async (err: any, authData: any)=>{
            if(err){
                res.sendStatus(403);
            }
            else{                
                pool.query('SELECT * FROM user WHERE cod = ? ', authData.user[0].cod , async function (err, result, fields) {
                    if (err) {
                        throw err;
                    }
                    if (result.length > 0) {
                        res.json( { result: result } );
                    }
                    else{
                        res.json({ message:"Cod User not found"});
                    }
                });
                
            }
        });
    }
}

const noteController = new NoteController();
export default noteController;