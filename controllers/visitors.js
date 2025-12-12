import { mysql_con } from '../config/db.js';

const addVisitor = async (req, res, next) => {
    let responseData =  {
        'status' : 'Success',
        'message' : 'Visitor signed in successfully'
    };

    try{
        if(!req.body){
            throw new Error('No Body');
        }
        const inputs = req.body;

        if(!inputs.visitor_type || !inputs.visitor_area || !inputs.visitor_id || !inputs.visitor_phone_number){
            throw new Error('Missing required fields');
        }

        if(inputs.visitor_type !== '2'){
            if(
                !/^[0-9]{13}$/.test(inputs.visitor_id) && 
                !['1','2','3','4','5','6','7','8','9'].includes(inputs.visitor_id[0])
            ){
                throw new Error('Invalid Citizen ID format');
            }

            const query = 'SELECT 1 FROM rcode WHERE local_id = ? LIMIT 1;';
            const [result, fields] = await mysql_con.execute(query, [inputs.visitor_id.substring(1, 5)])
            if(result.length === 0){
                throw new Error('Invalid Citizen ID');
            }

            let sum = 0;
            for(let i = 0; i < 12; i++){
                sum += parseInt(inputs.visitor_id[i]) * (13 - i);
            }
            const check_digit = (11 - (sum % 11)) % 10;
            if(check_digit !== parseInt(inputs.visitor_id[12])){
                throw new Error('Invalid Citizen ID');
            }
        }else{
            if(!/(^[0-9A-Z]{8,}$)/.test(inputs.visitor_id)){
                throw new Error('Invalid Passport ID format');
            }
        }
     
        if(inputs.visitor_phone_number.length < 9){
            throw new Error('Phone Number is too short');
        }

        /** 
        const find_query = 'SELECT * FROM visitors WHERE visitor_id = ?;';
        const [result, fields] = await mysql_con.execute(find_query, [inputs.visitor_id])
        if(result.length === 0){
            const query = 'INSERT INTO visitors (visitor_id, phone_number, visitor_type, visitor_area) VALUES (?, ?, ?, ?);';
            await mysql_con.execute(query, [inputs.visitor_id, inputs.visitor_phone_number, inputs.visitor_type, inputs.visitor_area]);
        }
        if(result[0].phone_number !== inputs.visitor_phone_number || result[0].visitor_type !== inputs.visitor_type || result[0].visitor_area !== inputs.visitor_area){
            const query = 'UPDATE visitors SET phone_number = ?, visitor_type = ?, visitor_area = ?, update_date = NOW() WHERE visitor_id = ?;';
            await mysql_con.execute(query, [inputs.visitor_phone_number, inputs.visitor_type, inputs.visitor_area, inputs.visitor_id]);
        }

        */

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
            inputs.visitor_id, 
            inputs.visitor_phone_number, 
            inputs.visitor_type, 
            inputs.visitor_area
        ]);

        const query = 'INSERT INTO visitors_sign_in (visitor_id) VALUES (?);';
        await mysql_con.execute(query, [inputs.visitor_id]);
        
        res.json(responseData);
    }catch(error){
        next(error);
    }
}
export { addVisitor };