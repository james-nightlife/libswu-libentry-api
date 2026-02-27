import { mysql_con } from '../config/db.js';
import jwt from 'jsonwebtoken'; 
import { fetchUser } from '../services/fetch-user.js';

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

const getMyInfo = async (req, res, next) => {
        if (!req.headers['api-token']) {
            res.status(401).json({
                'message': 'Unauthorized: No token provided'
            });
            return;
        }
        const authHeader = req.headers['api-token'];
        const decoded = jwt.verify(authHeader, process.env.JWT_SECRET);
        let userData;
    
        if(!decoded || !decoded.username){
            res.status(401).json({
                'message': 'Unauthorized: Invalid token'
            });
            return;
        }
    
        try{
            userData = await fetchUser(decoded.username);
    
            if(!userData){
                res.status(404).json({
                    'message': 'User not found'
                });
                return;
            }   
            
        }catch(err){
            res.status(401).json({
                'message': err.message
            });
        }
        
        res.status(200).json({
            'message': 'Authorized',
            'data': userData
        });
}

export { getUsers, getMyInfo }