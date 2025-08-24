import mysql from "mysql2/promise";

const mysql_con_config = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 3306,
}

const getStudent = async (req, res) => {
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
} 


export { getStudent }