import { mysql_con } from '../config/db.js';

const passwordSave = async (username, password) => {
    const query = 'INSERT INTO `users_password` (buasri_id, password) VALUES (?, MD5(?)) ON DUPLICATE KEY UPDATE password = MD5(?), update_date = NOW();';
    try {
        const [result, fields] = await mysql_con.execute(query, [username, password, password]);
    }catch(e){
        console.error('Error saving password:', e);
        throw new Error('Failed to save password');
    }
}

export { passwordSave };