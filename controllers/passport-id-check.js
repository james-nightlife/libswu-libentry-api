import mysql from "mysql2/promise";

const mysql_con_config = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 3306,
}

const passportIDCheck = async (req, res, next) => {
    if(req.body){
        const inputs = req.body;
        if('passport_id' in inputs){
            const passport_id = inputs.passport_id; 
            if(/^[A-Z]{1,2}[0-9]{6,7}$/.test(passport_id)){
                // Valid Citizen ID
                const mysql_con = await mysql.createConnection({
                    ...mysql_con_config,
                })
                try{
                    const query = 'SELECT * FROM visitors WHERE visitor_id = ?;';
                    const [result, fields] = await mysql_con.execute(query, [passport_id])
                    var authorized = false;
                    // Check if Citizen ID is already registered
                    if(result.length > 0){
                        authorized = true;
                    }else{
                        // Citizen ID is valid but not registered
                        const query = 'INSERT INTO visitors (visitor_id) VALUES (?);';
                        await mysql_con.execute(query, [passport_id]);
                        authorized = true; // Now it is registered
                    }
                    if(authorized){
                        const query = 'INSERT INTO visitors_sign_in (visitor_id) VALUES (?);';
                        await mysql_con.execute(query, [passport_id]);
                        // Citizen ID is valid and registered
                        res.json({
                            'message' : 'Citizen ID is valid',
                            'passport_id' : passport_id,
                        })
                    }else{
                        res.status(400).json({
                            'message' : 'Citizen ID is valid but not registered'
                        })
                    }
                    mysql_con.end();
                }catch(e){
                    res.status(400).json({
                        'message' : e
                    })
                }
            }else{
                res.status(400).json({
                    'message' : 'Passport ID must be in the format of 1-2 uppercase letters followed by 6-7 digits'
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