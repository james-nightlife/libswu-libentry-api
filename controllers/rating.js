import { mysql_visitor } from "../config/db.js";
import { BadRequestError, ValidationError } from "../services/exceptions.js";

export const ratingVisitor = async (req, res, next) => {
    const {rating, suggestion, visitor_id} = req.body;
    console.log(rating, suggestion, visitor_id)
    try{
        if(!rating || !visitor_id){
            throw new BadRequestError('ส่งข้อมูลไม่ครบถ้วน')
        }
        const query = 'UPDATE `visitors_sign_in` SET `rating_score`=?, `suggestion`=?, `rating_time`=NOW() WHERE ((`visitor_id`=?) AND (DATE(`sign_in_time`) <> DATE(NOW())) AND (`rating_score` IS NULL)) ORDER BY `sign_in_time` DESC LIMIT 1;'
        const [result, field] = await mysql_visitor.execute(query, [rating, suggestion || null, visitor_id])
        console.log(result)
        if(!result){
            throw new ValidationError('')
        }
        res.status(200).json({
            message: 'บันทึกข้อมูลสำเร็จ'
        })
    }catch(e){
        console.error(e);
        next(e);
    }finally{
        
    }
}