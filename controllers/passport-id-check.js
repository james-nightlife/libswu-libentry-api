import mysql from "mysql2/promise";

const mysql_con_config = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 3306,
}

const passportIDCheck = async (req, res, next) => {
    const mysql_con = await mysql.createConnection({
            ...mysql_con_config,
        })
    
        try{
            if(req.method !== 'POST'){
                res.status(405).json({
                    'message' : 'Method Not Allowed'
                })
                return;
            }
            if(!req.headers['content-type'] || !req.headers['content-type'].includes('application/json')){
                res.status(415).json({
                    'message' : 'Content-Type must be application/json'
                })
                return;
            }
            if(!req.body){
                res.status(400).json({
                    'message' : 'No Body'
                })
                return;
            }
            const inputs = req.body;
            if(!('passport_id' in inputs)){
                res.status(400).json({
                    'message' : 'No Passport ID input'
                })
                return;
            }
            if(!/(^[0-9A-Z]{8,}$)/.test(inputs.passport_id)){
                res.status(400).json({
                    'message' : 'Invalid Passport ID format'
                })
                return;
            }
            if(!('phone_number' in inputs)){
                res.status(400).json({
                    'message' : 'No Phone Number input'
                })
                return;
            }
            if(inputs.phone_number.length < 9){
                res.status(400).json({
                    'message' : 'Phone Number is too short'
                })
                return;
            }
            const find_query = 'SELECT * FROM visitors WHERE visitor_id = ?;';
            const [result, fields] = await mysql_con.execute(find_query, [inputs.passport_id])
            // If visitor does not exist, register them
            if(result.length === 0){
                // Register visitor
                const query = 'INSERT INTO visitors (visitor_id, phone_number) VALUES (?, ?);';
                await mysql_con.execute(query, [inputs.passport_id, inputs.phone_number]);
            }
            if(result[0].phone_number !== inputs.phone_number){
                // Update phone number
                const query = 'UPDATE visitors SET phone_number = ? WHERE visitor_id = ?;';
                await mysql_con.execute(query, [inputs.phone_number, inputs.passport_id]);
            }
            // Sign in visitor
            const query = 'INSERT INTO visitors_sign_in (visitor_id) VALUES (?);';
            await mysql_con.execute(query, [inputs.passport_id]);
            res.json({
                'message' : 'Citizen ID is valid',
                'passport_id' : inputs.passport_id,
            })
        }catch(e){
            res.status(400).json({
                'message' : e
            })
            return;
        }
        finally{
            mysql_con.end();
        }
}

export { passportIDCheck }