import { ExistingError, BadRequestError, UnauthorizedError } from '../services/exceptions.js';
import { mysql_visitor as mysql_con } from '../config/db.js' ;
import deleteFile from '../services/deleteFile.js';
import { JWTEncode } from '../services/JWTEncode.js';
import { validateVisitorID } from '../services/validateVisitorID.js';
import { validateVisitorPhoneNumber } from '../services/validateVisitorPhoneNumber.js';
import { auditLog } from '../services/auditLog.js';
import { gateSignIn } from '../services/gateSignIn.js';
import { gateExistCheck } from '../services/gateExistCheck.js';
import { gateAutoIncrement } from '../services/gateAutoIncrement.js';
import { gateAddData } from '../services/gateAddData.js';

export const addVisitor = async (req, res, next) => {
    const { visitor_type, visitor_area, visitor_id, visitor_phone_number } = req.body;

    if(!visitor_type || !visitor_area || !visitor_id || !visitor_phone_number){
        return res.status(400).json({
            status: 'Error',
            message: 'Missing required fields'
        });
    }
    try{
        if(visitor_type !== '2'){
            if(
                !/^[0-9]{13}$/.test(visitor_id) && 
                !['1','2','3','4','5','6','7','8','9'].includes(visitor_id[0])
            ){
                return res.status(400).json({
                    status: 'Error',
                    message: 'Invalid Citizen ID format'
                });
            }

            const regionCodeQuery = 'SELECT 1 FROM rcode WHERE local_id = ? LIMIT 1;';
            const [result, fields] = await mysql_con.execute(regionCodeQuery, [visitor_id.substring(1, 5)])
            if(result.length === 0){
                return res.status(400).json({
                    status: 'Error',
                    message: 'Invalid Citizen ID'
                });
            }

            let sum = 0;
            for(let i = 0; i < 12; i++){
                sum += parseInt(visitor_id[i]) * (13 - i);
            }
            const check_digit = (11 - (sum % 11)) % 10;
            if(check_digit !== parseInt(visitor_id[12])){
                return res.status(400).json({
                    status: 'Error',
                    message: 'Invalid Citizen ID'
                });
            }
        }else{
            if(!/(^[0-9A-Z]{8,}$)/.test(visitor_id)){
                return res.status(400).json({
                    status: 'Error',
                    message: 'Invalid Passport ID format'
                });
            }
        }
     
        if(visitor_phone_number.length < 9){
            return res.status(400).json({
                status: 'Error',
                message: 'Phone Number is too short'
            });
        }

        const upsertQuery = `
            INSERT INTO visitors (visitor_id, phone_number, visitor_type, visitor_area, update_date) 
            VALUES (?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE 
                phone_number = VALUES(phone_number),
                visitor_type = VALUES(visitor_type),
                visitor_area = VALUES(visitor_area),
                update_date = NOW();
        `;
        
        await mysql_con.execute(upsertQuery, [
            visitor_id, 
            visitor_phone_number, 
            visitor_type, 
            visitor_area
        ]);

        const signInQuery = 'INSERT INTO visitors_sign_in (visitor_id) VALUES (?);';
        await mysql_con.execute(signInQuery, [visitor_id]);
        
        return res.status(200).json({
            status: 'Success',
            message: 'Visitor added successfully'
        });
    }catch(error){
        res.status(500).json({
            status: 'Error',
            message: error.message || 'Internal Server Error'
        });
    }
}

export const getVisitors = async (req, res, next) => {
    try{
        const query = 'SELECT visitor_id, phone_number, visitor_type, visitor_area, update_date FROM visitors;';
        const [result, fields] = await mysql_con.execute(query);
        return res.status(200).json(result);
    }catch(error){
        res.status(500).json({
            status: 'Error',
            message: error.message || 'Internal Server Error'
        });
    }
}

// GET METHOD
export const getVisitorsNew = async (req, res, next) => {
    try{
        //console.log(req.params.decoded)
        if(!req.params.decoded.username){
            throw new UnauthorizedError('Admin Only')
        }
        const query = 'SELECT * FROM visitors;';
        const [result, fields] = await mysql_con.execute(query);
        auditLog('visitor', req.params.decoded.username || req.params.decoded.visitor_id || req.ip, 'getVisitors', 'visitor', 'success', req.ip)
        return res.status(200).json(result);
    }catch(e){
        console.error(e)
        auditLog('visitor', req.params.decoded.username || req.params.decoded.visitor_id || req.ip, 'getVisitors', 'visitor', 'failed', req.ip, e.message)
        next(e)
    }
}

// GET METHOD
export const getVisitorById = async (req, res, next) => {
    const { id } = req.params;

    try{
        if(!id){
            throw new BadRequestError('Incomplete Request')
        }

        const query = 'SELECT * FROM `visitors` WHERE `id`=?;';
        const [result, fields] = await mysql_con.execute(query, [id]);
        if(result.length !== 1){
            throw new ExistingError('Visitor not found')
        }
        auditLog('visitor', req.params.decoded.username || req.params.decoded.visitor_id || req.ip, 'getVisitor', id, 'success', req.ip)
        return res.status(200).json(result[0]);
    }catch(e){
        console.error(e)
        auditLog('visitor', req.params.decoded.username || req.params.decoded.visitor_id || req.ip, 'getVisitor', id, 'failed', req.ip, e.message)
        next(e)
    }
}

// POST METHOD 
export const addVisitorNew = async (req, res, next) => {
    /**
     * const visitor_type = 1;
     * const visitor_area = 1;
     * const visitor_id = '1103167890123';
     * const phone_number = '0812345678';
     * const firstname = 'John';
     * const lastname = 'Doe';
     * const filename = 'example.jpg';
     */
    const { visitor_type, visitor_area, visitor_id, phone_number, firstname, lastname, email } = req.body;
    
    try{
        if(
            !visitor_type || 
            !visitor_area || 
            !visitor_id || 
            !phone_number || 
            !firstname || 
            !lastname || 
            !email || 
            !req.file
        ){
            throw new BadRequestError('ข้อมูลไม่ครบถ้วน')
        }

        await validateVisitorID(visitor_id, visitor_type);
        await validateVisitorPhoneNumber(phone_number);
        const query = 'INSERT INTO `visitors` (visitor_type, visitor_area, visitor_id, phone_number, firstname, lastname, email, filename) VALUES (?, ?, ?, ?, ?, ?, ?, ?);';
        const [result, fields] = await mysql_con.execute(query, [visitor_type, visitor_area, visitor_id, phone_number, firstname, lastname, email, req.file.filename]);
        if(result.affectedRows !== 1){
            throw new Error('Failed to insert visitor into database');
        }

        auditLog(`visitor`, visitor_id, 'insert', visitor_id, 'success', req.ip);
        
        return res.status(201).json({
            message: 'Visitor added successfully'
        });
    }catch(e){
        console.error('Error during visitor creation:', e);
        auditLog(`visitor`, visitor_id, 'insert', visitor_id, 'failed', req.ip, e.message);
        // Delete the file if it was uploaded to disk
        if (req.file && req.file.path) {
            deleteFile(req.file.path);
        }

        return next(e);
    }
}

// POST METHOD /visitors/auth
export const signInVisitor = async (req, res, next) => {
    /** 
     * const username = '1103167890123';
     * const password = '0812345678';
    */
    const { username, password } = req.body;

    try{

        if(!username || !password) {
            throw new BadRequestError('Incomplete Request')
        }

        const query = 'SELECT * FROM `visitors` WHERE `visitor_id`=? AND `phone_number`=?;';
        const [result, fields] = await mysql_con.execute(query, [username, password]);
        if(result.length !== 1){
            throw new UnauthorizedError('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
        }
        const token = JWTEncode({ ...result[0] });
        auditLog(`visitor`, username || req.ip, 'signIn', username, 'success', req.ip);
        return res.status(200).json({ 
            token,
            ...result[0],
        });
    }catch(e){
        console.error('Error during visitor sign-in:', e);
        auditLog(`visitor`, username || req.ip, 'signIn', username, 'failed', req.ip, e.message);
        return next(e);
    }
}

// PUT METHOD /visitors/:id
export const editVisitor = async (req, res, next) => {
    /*
    const id = 1;
    const visitor_type = 5;
    const visitor_area = 1;
    const visitor_id = '1103167890123';
    const phone_number = '0812345678';
    const firstname = 'John';
    const lastname = 'Doe';
    const status = 1;
    }
    */

    const id = req.params.id;
    const { visitor_type, visitor_area, visitor_id, phone_number, firstname, lastname, status, email } = req.body;
    const filename = req.file ? req.file.filename : null;

    try{
        if(
            !id ||
            !visitor_id || 
            !visitor_type || 
            !visitor_area || 
            !phone_number || 
            !firstname || 
            !lastname || 
            !status ||
            !email
        ){
            throw new BadRequestError('Incomplete Request')
    }
        await validateVisitorID(visitor_id, visitor_type);
        await validateVisitorPhoneNumber(phone_number);

        const checkQuery = 'SELECT * FROM `visitors` WHERE `id`=?;';
        const [checkResult, checkFields] = await mysql_con.execute(checkQuery, [id]);
        if(checkResult.length !== 1){
            throw new ExistingError('Visitor not found');
        }

        const query = 'UPDATE `visitors` SET visitor_id = ?, visitor_type = ?, visitor_area = ?, phone_number = ?, firstname = ?, lastname = ?, email = ?, status = ?, filename = ?, update_date = NOW() WHERE `id`=?;';
        const [result, fields] = await mysql_con.execute(query, [
            visitor_id,
            visitor_type,
            visitor_area,
            phone_number,
            firstname,
            lastname,
            email,
            status,
            filename || checkResult[0].filename || null, // Use existing filename if no new file is uploaded
            id
        ]);
        if(result.affectedRows !== 1){
            throw new Error('Failed to update visitor in database');
        }

        if(status === '1' && (status !== checkResult[0].status)){
            const gate_cookies = await gateSignIn();
            const gate_exist = await gateExistCheck(gate_cookies, visitor_id);
            if(!gate_exist){
                const gate_id = await gateAutoIncrement(gate_cookies);
                await gateAddData(gate_cookies, gate_id, visitor_id, firstname, undefined, lastname, 'บุคคลภายนอก', undefined, undefined)
            }
            
            
        }

        await auditLog(`visitor`, req.params.decoded.username || req.params.decoded.visitor_id || visitor_id, 'update', visitor_id, 'success', req.ip);
        
        return res.status(200).json({
            message: 'Visitor updated successfully'
        });
    }
        catch(e){
            auditLog(`visitor`, req.params.decoded.username || req.params.decoded.visitor_id || visitor_id, 'update', visitor_id, 'failed', req.ip, e.message);
            console.error('Error during visitor update:', e);
            // Delete the file if it was uploaded to disk
            if (req.file && req.file.path) {
                deleteFile(req.file.path);
            }

            return next(e)
        }
}