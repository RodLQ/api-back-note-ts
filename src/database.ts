import mysql from 'mysql';
import keys from './keys';

const pool = mysql.createPool( keys.database );
pool.getConnection( ( error, connection )=>{
     
    if(error){
        throw error;
    }
    connection.release();
    console.log("BD conected");

} );

export default pool;