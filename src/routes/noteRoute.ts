import { Router } from "express";
import noteController from "../controllers/noteController";

class NoteRoute{
    
    public router: Router = Router();

    constructor(){
        this.config();
    }
    config(){
        //No TOKEN
        this.router.post('/login', noteController.loginUser );
        this.router.post('/registration/user', noteController.registrationUser );
        
        //WHITH TOKEN
        this.router.get('/list/user', this.verifyToken ,noteController.listUser );
        this.router.get('/list/note', this.verifyToken ,noteController.listNote );
        this.router.get('/get/note/:cod', this.verifyToken ,noteController.getNote );
    
        this.router.post('/registration/note', this.verifyToken ,noteController.registrationNote );
        
        this.router.put('/update/note/:cod', this.verifyToken ,noteController.updateNote);
        this.router.put('/update/user/:cod', this.verifyToken ,noteController.updateUser);
        
        this.router.delete('/delete/note/:cod', this.verifyToken, noteController.deleteNote);

        //LIMIT
        this.router.get('/list/note/rank/:min&:max', this.verifyToken, noteController.listNoteMinMax );
    }

    verifyToken(req:any, res:any, next:any){
        const bearerHeader = req.headers['authorization'];
        if(typeof bearerHeader !== 'undefined'){
            const bearerToken = bearerHeader.split(" ")[1];
            req.token = bearerToken;
            next();
        }
        else{
            res.sendStatus(403);
        }
    }

}
const noteRoute = new NoteRoute();
export default noteRoute.router;