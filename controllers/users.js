import { mysql_con } from '../config/db.js';
import jwt from 'jsonwebtoken'; 

const getUsers = async (req, res, next) => {
    var response = {};
    try{
        if(!req.body){
            throw new Error('No Body');
        }
        const inputs = req.body;

        if(!inputs.buasri_id){
            throw new Error('Missing required fields');
        }

        /** 
        if(!inputs.auth_token){
            throw new Error('Missing auth_token');
        }   

        jwt.verify(inputs.auth_token, process.env.JWT_SECRET);
        */

        const query = 'SELECT unique_id, name_th, lname_th FROM users WHERE buasri_id = ? AND (employee_status_th = "ปฎิบัติราชการปกติ" OR student_status = "นิสิตปัจจุบัน");';
        const [result, fields] = await mysql_con.execute(query, [inputs.buasri_id])
        if(result.length === 0){
            throw new Error('No user found');
        }
        response = {
            result : result
        };
        res.json(response)
    }catch(e){
        next(e);
    }
} 

export { getUsers }