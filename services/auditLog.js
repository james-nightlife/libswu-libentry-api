
import { mysql_audit_log } from '../config/db.js'

export const auditLog = async (table, username, action, target, status, ip, error = null) => {
    try{
        const query = `INSERT INTO \`${table}\` (\`username\`, \`action\`, \`target\`, \`status\`, \`ip\`, \`error\`) VALUES (?, ?, ?, ?, ?, ?);`;
        const [db_result, fields] = await mysql_audit_log.execute(query, [username, action, target, status, ip, error]);
    }catch(e){
        console.error('Audit log write failure:', e);
    }
}