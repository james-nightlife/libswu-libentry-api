import { mysql_con } from '../config/db.js';
import jwt from 'jsonwebtoken'; 
import { fetchUser } from '../services/fetch-user.js';

const getUsers = async (req, res, next) => {
    var { buasri_id, decoded } = req.params;

    try{
        if(!buasri_id){
            const allUsersQuery = 'SELECT unique_id, name_th, lname_th FROM users WHERE employee_status_th = "ปฎิบัติราชการปกติ" OR student_status = "นิสิตปัจจุบัน";';
            const [result, fields] = await mysql_con.execute(allUsersQuery);
            return res.status(200).json({
                result : result
            });
        }

        const query = 'SELECT unique_id, name_th, lname_th FROM users WHERE buasri_id = ? AND (employee_status_th = "ปฎิบัติราชการปกติ" OR student_status = "นิสิตปัจจุบัน");';
        const [result, fields] = await mysql_con.execute(query, [buasri_id])
        if(result.length === 0){
            return res.status(404).json({
                message: 'User not found'
            });
        }
        return res.status(200).json({
                result : result
        });
    }catch(e){
        return res.status(500).json({
            message: e.message
        });
    }
} 

const getMyInfo = async (req, res, next) => {
    const { decoded } = req.body;

    try{
        const query = 'SELECT unique_id, name_th, lname_th FROM users WHERE buasri_id = ? AND (employee_status_th = "ปฎิบัติราชการปกติ" OR student_status = "นิสิตปัจจุบัน");';
        const [result, fields] = await mysql_con.execute(query, [decoded.username])
        if(result.length === 0){
            return res.status(404).json({
                message: 'User not found'
            });
        }
        return res.status(200).json({
                result : result
        });

    }catch(e){
        return res.status(500).json({
            message: e.message
        });
    }
}

export { getUsers, getMyInfo }