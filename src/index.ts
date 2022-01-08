import express, { Application } from 'express';
import cors from 'cors';
import noteRoute from './routes/noteRoute';

class Server{
    public app: Application;
    public serverHttp:any;

    public socket:any;

    constructor(){
        this.app = express();
        this.serverHttp = require('http').Server(this.app);
        
        this.webSocket();
        
        this.config();
        this.routes();
    }
    config(){
        this.app.set('port', process.env.PORT || 3000);
        this.app.use(express.json());
        this.app.use(cors());
        this.app.use(express.urlencoded({extended:false}));
    }
    routes(){
        this.app.use('/api', noteRoute );
    }
    start(){
        this.serverHttp.listen( this.app.get('port'), ()=>{
            console.log('Server on port ', this.app.get('port'));
        } );
    }

    webSocket(){
        
        const io = require('socket.io')( this.serverHttp , 
            {
                cors: { origin: "*" }
            }     
        );
        
        io.on( 'connection',  ( socket:any ) => {
                console.log(' User conectado, ID: ', socket.id);

                socket.on('modified-note', (data:any)=>{
                    
                    console.log(data);

                } );

            }
        );
        this.socket = io.on( 'connection' , (socket:any) => {socket} );

    }
}

const server = new Server();
server.start();
export default server.socket;
