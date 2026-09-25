import axios from "axios";

export const gateAutoIncrement = async (cookies_string) => {
    try{
        const initUserInfo_req = await axios.get(
            `${process.env.GATE_API_URL}/v1/users/initUserInfo`,
            {
                headers: { 
                    'Cookie': cookies_string 
                }
            }
        )
        const initUserInfo_res = await initUserInfo_req.data;
        if(initUserInfo_res.Result.ResultCode !== 0){
            throw new Error(`Get user ID failed, result code: ${initUserInfo_res.Result.ResultCode}`);
        }
        return new_id_data.dmUserInfo.ID
    }catch(e){
        throw new Error('')
    }            
}