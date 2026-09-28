import axios from "axios";

export const gateExistCheck = async (cookies_string, user_id) => {
    // Fetch the user from the gate system using the provided user_id
    try{
        const users = await axios.get(
            `${process.env.GATE_API_URL}/v1/users?groupID=0&subInclude=true&offset=0&limit=10000&searchCategory=uniqueid&searchKeyword=${user_id}`,
            {
                headers: {
                    'Cookie': cookies_string 
                }
            }
        )
        
        const usersData = users.data;

        if(usersData.Result.ResultCode !== 0){
            throw new Error(`Get users failed, result code: ${usersData.Result.ResultCode}`);
        }

        const userlist = usersData.UserList;
        const user_found = userlist.find(u => u.UniqueID == user_id);
        return user_found;
    }catch(e){
        console.error(e)
        throw new Error('Checking User Data in Gate System Failed ');
    }
}