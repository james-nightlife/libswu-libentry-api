import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

const mysql_con_config = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 3306,
}

var app = express();
app.use(express.json());
app.use(cors());

app.listen(3010, () => {
    console.log(`Application is running on port 3010`);
    //console.log(`MySQL connection config: ${JSON.stringify(mysql_con_config)}`);
})

app.post('/get-student', async(req, res, next) => {
    if(req.body){
        const inputs = req.body;
        if('buasri_id' in inputs){
            const mysql_con = await mysql.createConnection({
                ...mysql_con_config,
            })
            try{
                const query = 'SELECT unique_id, name_th, lname_th FROM users WHERE buasri_id = ? AND (employee_status_th = "ปฎิบัติราชการปกติ" OR student_status = "นิสิตปัจจุบัน");';
                const [result, fields] = await mysql_con.execute(query, [inputs.buasri_id])
                if(result){
                    res.json({
                        'message' : result
                    })
                }
                mysql_con.end();
            }catch(e){
                res.json({
                    'message' : e
                })
            }
        }else{
            res.json({
                'message' : 'No Buasri ID input'
            })
        }
    }else{
        res.json({
            'message' : 'No Body'
        })
    } 
})

app.post('/citizen-id-check', async(req, res, next) => {
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
            if(check_digit === parseInt(citizen_id[12])){
                // Valid Citizen ID
                const query = 'SELECT * FROM visitors WHERE visitor_id = ?;';
                const [result, fields] = await mysql_con.execute(query, [citizen_id])
                var authorized = false;
                // Check if Citizen ID is already registered
                if(result.length > 0){
                    authorized = true;
                }else{
                    // Citizen ID is valid but not registered
                    const query = 'INSERT INTO visitors (visitor_id) VALUES (?);';
                    await mysql_con.execute(query, [citizen_id]);
                    authorized = true; // Now it is registered
                }
                if(authorized){
                    const query = 'INSERT INTO visitors_sign_in (visitor_id) VALUES (?);';
                    await mysql_con.execute(query, [citizen_id]);
                    // Citizen ID is valid and registered
                    res.json({
                        'message' : 'Citizen ID is valid',
                        'citizen_id' : citizen_id,
                        'local_th' : local_th,
                    })
                }else{
                    res.status(400).json({
                        'message' : 'Citizen ID is valid but not registered'
                    })
                }
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


    /*
    if(req.body){
        const inputs = req.body;
        if('citizen_id' in inputs){
            const citizen_id = inputs.citizen_id;
            if(citizen_id.length === 13 && /^[0-9]+$/.test(citizen_id)){
                if(['1','2','3','4','5','6','7','8','9'].includes(citizen_id[0])){
                    const query = 'SELECT * FROM rcode WHERE cal_id = ?;';
                    const mysql_con = await mysql.createConnection({
                        ...mysql_con_config,
                    })
                    try{
                        const [result, fields] = await mysql_con.execute(query, [citizen_id.substring(1, 5)])
                        if(result.length === 0){
                            res.status(400).json({
                                'message' : 'Citizen ID is invalid'
                            })
                            return;
                        }else{
                            
                        }
                    }catch(e){
                        res.status(400).json({
                            'message' : e
                        })
                        return;
                    }finally{
                        mysql_con.end();
                    }
                    var sum = 0;
                    for(let i = 0; i < 12; i++){
                        sum += parseInt(citizen_id[i]) * (13 - i);
                    }
                    const check_digit = (11 - (sum % 11)) % 10;
                    if(check_digit === parseInt(citizen_id[12])){
                        // Valid Citizen ID
                        const mysql_con = await mysql.createConnection({
                            ...mysql_con_config,
                        })
                        try{
                            const query = 'SELECT * FROM visitors WHERE visitor_id = ?;';
                            const [result, fields] = await mysql_con.execute(query, [citizen_id])
                            var authorized = false;
                            // Check if Citizen ID is already registered
                            if(result.length > 0){
                                authorized = true;
                            }else{
                                // Citizen ID is valid but not registered
                                const query = 'INSERT INTO visitors (visitor_id) VALUES (?);';
                                await mysql_con.execute(query, [citizen_id]);
                                authorized = true; // Now it is registered
                            }
                            if(authorized){
                                const query = 'INSERT INTO visitors_sign_in (visitor_id) VALUES (?);';
                                await mysql_con.execute(query, [citizen_id]);
                                // Citizen ID is valid and registered
                                res.json({
                                    'message' : 'Citizen ID is valid',
                                    'citizen_id' : citizen_id,
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
                            'message' : 'Citizen ID is invalid'
                        })
                    }
                }else{
                    res.status(400).json({
                        'message' : 'Citizen ID must start with 1-9'
                    })
                    return;
                }
            }else{
                res.status(400).json({
                    'message' : 'Citizen ID must be 13 digits'
                })  
            }
        }else{
            res.status(400).json({
                'message' : 'No Citizen ID input'
            })
        }
    }else{
        res.status(400).json({
            'message' : 'No Body'
        })
    }

    */
})


app.post('/passport-id-check', async(req, res, next) => {
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

})