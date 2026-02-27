import { mysql_con } from '../config/db.js';

const passwordValidate = async (username, password) => {
    const query = 'SELECT 1 FROM users_password WHERE buasri_id = ? AND password = MD5(?) LIMIT 1;';
    try {
        const [result, fields] = await mysql_con.execute(query, [username, password]);
        return result.length > 0;
    }catch(e){
        console.error('Error validating password:', e);
        throw new Error('Failed to validate password');
    }
}

export { passwordValidate };