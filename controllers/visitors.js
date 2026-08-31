import { mysql_visitor as mysql_con } from '../config/db.js' ;

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
        return res.status(200).json({
            status: 'Success',
            data: result
        });
    }catch(error){
        res.status(500).json({
            status: 'Error',
            message: error.message || 'Internal Server Error'
        });
    }
}

export const getVisitorById = async (req, res, next) => {
    const { id } = req.params;

    if(!id){
        return res.status(400).json({
            'message': 'กรุณาระบุ ID'
        })
    }

    return res.status(501).json({
        'message': ''
    })
}

export const signInVisitor = async (req, res, next) => {
    const { username, password } = req.body;

    if(!username || !password) {
        return res.status(400).json({
            'message': 'กรุณาระบบชื่อผู้ใช้งานและรหัสผ่าน'
        })
    }

    try{
        const query = 'SELECT * FROM `visitors` WHERE `visitor_id`=? AND `phone_number`=?;';
        const [result, fields] = await mysql_con.execute(query, [username, password]);
        if(result.length !== 1){
            return res.status(404).json({
                'message': 'ไม่พบข้อมูล'
            })
        }
        return res.status(200).json(result)
    }catch(e){

    }

    return res.status(501).json({
        'message': ''
    })
}

export const addVisitorNew = async (req, res, next) => {
    const { visitor_type, visitor_area, visitor_id, phone_number, firstname, lastname } = req.body;
    
    if(!visitor_type || !visitor_area || !visitor_id || !phone_number || !firstname || !lastname){
        return res.status(400).json({
            'message': 'ข้อมูลไม่ครบถ้วน'
        })
    }

    return res.status(501).json({
        'message': ''
    })
}