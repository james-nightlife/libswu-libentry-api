import { db_243, db_219 } from '../config/db.js';

const avService = async (req, res, next) => {
    var response = {};
    // Start time for query performance measurement
    const start_time = new Date();
    try{
        if(process.env.API_SCOPE !== 'internal'){
            throw new Error("Unauthorized Access");
        }
        // Ensure connections are established
        if (!db_243 || !db_219) {
            throw new Error("Database connection not established");
        }
        // Only allow GET requests
        if (req.method !== 'GET') {
            return res.status(405).json({ error: "Method Not Allowed" });
        }
        // Fetch data from both databases
        const [rows_243] = await db_243.query("SELECT `tbl_log`.`l_id`,`tbl_log`.`u_id`,`tbl_log`.`i_id`,`tbl_item`.`i_name`,`tbl_log`.`t_id`,`tbl_type`.`t_name`,`tbl_log`.`timestamp` FROM `tbl_log` LEFT JOIN `tbl_item` ON `tbl_log`.`i_id` = `tbl_item`.`i_id` LEFT JOIN `tbl_type` ON `tbl_log`.`t_id` = `tbl_type`.`t_id` WHERE `e_id` = 'borrow';");
        const [rows_219] = await db_219.query("SELECT `unique_id`, `name_th`, `lname_th`, `role`, `faculty_th`, IF(`role` = 'นิสิต',`student_status`, `employee_status_th`) AS `status` FROM `users`;");
        //res.json(rows_243);
        /*
        const joined = rows_243.map(a => {
            const bMatch = rows_219.find(b => b.unique_id === a.u_id);
            return {
              ...a,
              ...(bMatch || {})
            };
        });
        */
        // Optimize join using a Map for faster lookups
        const userMap = new Map(rows_219.map(b => [b.unique_id, b]));
        const joined = rows_243.map(a => {
            const { unique_id, ...restUser } = userMap.get(a.u_id) || {};
            return {
              ...a,
              ...restUser
            };
          });

        // Calculate query time
        const end_time = new Date();
        const time_diff = (end_time - start_time)/1000; // in seconds

        response = {
            success: true,
            query_time: time_diff,
            length: joined.length,
            data: joined
        }
        // Send response
        res.json(response);

    }catch(error){
        next(error);
    }
}

export { avService };
