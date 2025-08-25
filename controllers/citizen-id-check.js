import mysql from "mysql2/promise";

const mysql_con_config = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 3306,
}

const citizenIDCheck = async (req, res, next) => {
    // Check if request body exists and contains citizen_id
    if(
        req.body && 
        'citizen_id' in req.body && 
        /^[0-9]{13}$/.test(req.body.citizen_id) && 
        ['1','2','3','4','5','6','7','8','9'].includes(req.body.citizen_id[0])
    ){
        const citizen_id = req.body.citizen_id;
        const mysql_con = await mysql.createConnection({
            ...mysql_con_config,
        })
        try{
            const query = 'SELECT * FROM rcode WHERE local_id = ?;';
            const [result, fields] = await mysql_con.execute(query, [citizen_id.substring(1, 5)])
            // Check if local_id exists
            if(result.length === 0){
                res.status(400).json({
                    'message' : 'Citizen ID is invalid'
                })
                return;
            }
            const local_th = result[0].local_th;
            var sum = 0;
            for(let i = 0; i < 12; i++){
                sum += parseInt(citizen_id[i]) * (13 - i);
            }
            const check_digit = (11 - (sum % 11)) % 10;
            // Validate check digit
            if(check_digit === parseInt(citizen_id[12])){
                const find_query = 'SELECT * FROM visitors WHERE visitor_id = ?;';
                const [result, fields] = await mysql_con.execute(find_query, [citizen_id])
                // If visitor does not exist, register them
                if(result.length === 0){
                    const query = 'INSERT INTO visitors (visitor_id) VALUES (?);';
                    await mysql_con.execute(query, [citizen_id]);
                }
                // Sign in visitor
                const query = 'INSERT INTO visitors_sign_in (visitor_id) VALUES (?);';
                await mysql_con.execute(query, [citizen_id]);
                res.json({
                    'message' : 'Citizen ID is valid',
                    'citizen_id' : citizen_id,
                    'local_th' : local_th,
                })
            }else{
                res.status(400).json({
                    'message' : 'Citizen ID is invalid'
                })
            }
        }catch(e){
            res.status(400).json({
                'message' : e
            })
        }finally{
            mysql_con.end();
        }
    }else{
        res.status(400).json({
            'message' : 'Citizen ID is invalid'
        })
    }
}

export { citizenIDCheck }