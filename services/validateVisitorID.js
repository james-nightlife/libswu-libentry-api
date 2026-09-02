import { mysql_visitor as mysql_con } from  '../config/db.js';

export const validateVisitorID = async (visitor_id, visitor_type) => {
    if(visitor_type !== '2'){
            if(
                !/^[0-9]{13}$/.test(visitor_id) && 
                !['1','2','3','4','5','6','7','8','9'].includes(visitor_id[0])
            ){
                throw new Error('Invalid Citizen ID format');
            }

            try{
                const regionCodeQuery = 'SELECT 1 FROM rcode WHERE local_id = ? LIMIT 1;';
                const [result, fields] = await mysql_con.execute(regionCodeQuery, [visitor_id.substring(1, 5)])
                if(result.length !== 1){
                    throw new Error('Invalid Citizen ID');
                }
            }catch(error){
                throw new Error('Database error while validating Citizen ID');
            }
            
            let sum = 0;
            for(let i = 0; i < 12; i++){
                sum += parseInt(visitor_id[i]) * (13 - i);
            }
            const check_digit = (11 - (sum % 11)) % 10;
            if(check_digit !== parseInt(visitor_id[12])){
                throw new Error('Invalid Citizen ID');
            }
        }else{
            if(!/(^[0-9A-Z]{8,}$)/.test(visitor_id)){
                throw new Error('Invalid Passport ID format');
            }
            }
}