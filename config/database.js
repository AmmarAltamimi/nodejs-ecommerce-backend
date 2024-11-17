
const mongoose = require("mongoose");

exports. dbConnection = () => {

    mongoose.connect(process.env.DB_URL).then((conn)=>{
        console.log(`database connected ${conn.connection.host}`);
        
    }).catch((error)=>{
        console.log(`database error: ${error}`);
        process.exit(1);
        
    });
}