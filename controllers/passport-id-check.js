import mysql from "mysql2/promise";

const mysql_con_config = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 3306,
}

const passportIDCheck = async (req, res, next) => {
    // Check if request body exists
    if(req.body){
        const inputs = req.body;
        // Check if passport_id exists in request body
        if('passport_id' in inputs){
            const passport_id = inputs.passport_id; 
            // Validate passport_id format: 1-2 uppercase letters followed by 6-8 digits or 1 uppercase letter followed by 3 digits, 1 uppercase letter and 3 digits
            if(/(^[A-Z]{1,2}[0-9]{6,7,8}$)|(^[A-Z]{1}[0-9]{3}[A-Z]{1}[0-9]{3}$)/.test(passport_id)){
                const mysql_con = await mysql.createConnection({
                    ...mysql_con_config,
                })
                try{
                    const find_query = 'SELECT * FROM visitors WHERE visitor_id = ?;';
                    const [result, fields] = await mysql_con.execute(find_query, [passport_id])
                    // If visitor does not exist, register them
                    if(result.length === 0){
                        // Register visitor
                        const query = 'INSERT INTO visitors (visitor_id) VALUES (?);';
                        await mysql_con.execute(query, [passport_id]);
                    }
                    // Sign in visitor
                    const query = 'INSERT INTO visitors_sign_in (visitor_id) VALUES (?);';
                    await mysql_con.execute(query, [passport_id]);
                    res.json({
                        'message' : 'Citizen ID is valid',
                        'passport_id' : passport_id,
                    })
                    mysql_con.end();
                }catch(e){
                    res.status(400).json({
                        'message' : e
                    })
                }
            }else{
                res.status(400).json({
                    'message' : 'Invalid Passport ID format'
                })
                return;
            }
        }else{
            res.status(400).json({
                'message' : 'No Passport ID input'
            })
        }   
    }else{
        res.status(400).json({
            'message' : 'No Body'
        })
    }
}

export { passportIDCheck }