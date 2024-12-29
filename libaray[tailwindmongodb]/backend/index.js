import express,{json} from 'express';
import { admin } from './routes/adminroute.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from "dotenv";
dotenv.config();
const app=express();
app.use(cors({
    origin:'http://127.0.0.1:5504',
    credentials:true

}));
app.use(json())
app.use(cookieParser());
app.use('/', admin)
const port =process.env.port;







app.listen(port,()=>{
    console.log(`server is listening to ${port}`)
})