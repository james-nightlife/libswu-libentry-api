import mysql from "mysql2/promise";

const mysql_con_config = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 3306,
}

const citizenIDCheck = async (req, res, next) => {
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
        if(!('citizen_id' in inputs)){
            res.status(400).json({
                'message' : 'No Citizen ID input'
            })
            return;
        }
        if(!/^[0-9]{13}$/.test(inputs.citizen_id)){
            res.status(400).json({
                'message' : 'Citizen ID must be 13 digits'
            })
            return;
        }
        if(!['1','2','3','4','5','6','7','8','9'].includes(inputs.citizen_id[0])){
            res.status(400).json({
                'message' : 'Citizen ID is invalid'
            })
            return;
        }
    
    
        const query = 'SELECT * FROM rcode WHERE local_id = ?;';
        const [result, fields] = await mysql_con.execute(query, [inputs.citizen_id.substring(1, 5)])
        // Check if local_id exists
        if(result.length === 0){
            res.status(400).json({
                'message' : 'Citizen ID is invalid'
            })
                return;
            }
            var sum = 0;
        for(let i = 0; i < 12; i++){
            sum += parseInt(inputs.citizen_id[i]) * (13 - i);
        }
        const check_digit = (11 - (sum % 11)) % 10;
        // Validate check digit
        if(check_digit !== parseInt(inputs.citizen_id[12])){
            res.status(400).json({
                'message' : 'Citizen ID is invalid'
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
        const [result_find, fields_find] = await mysql_con.execute(find_query, [inputs.citizen_id])
        // If visitor does not exist, register them
        if(result_find.length === 0){
            const query = 'INSERT INTO visitors (visitor_id, phone_number) VALUES (?, ?);';
            await mysql_con.execute(query, [inputs.citizen_id, inputs.phone_number]);
        }
        if(result_find[0].phone_number !== inputs.phone_number){
            const query = 'UPDATE visitors SET phone_number = ? WHERE visitor_id = ?;';
            await mysql_con.execute(query, [inputs.phone_number, inputs.citizen_id]);
        }
        // Sign in visitor
        const query_sign_in = 'INSERT INTO visitors_sign_in (visitor_id) VALUES (?);';
        await mysql_con.execute(query_sign_in, [inputs.citizen_id]);
        res.json({
            'message' : 'Citizen ID is valid',
            'citizen_id' : inputs.citizen_id,
            'local_th' : result[0].local_th,
        })
    }catch(e){
        res.status(400).json({
            'message' : e
        })
        return;
    }finally{
        mysql_con.end();
    }
}

export { citizenIDCheck }