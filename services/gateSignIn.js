import axios from "axios";

export const gateSignIn = async () => {
    try{
        const session = await axios.post(
            `${process.env.GATE_API_URL}/v1/login`,
            {
                "userId": process.env.GATE_USERID,
                "password": process.env.GATE_PASSWORD,
                "userType": 0
            },
            {
                headers: { 
                    'Content-Type': 'application/json' 
                }
            }
        )

        const sessionData = session.data;
        //console.log("Session Data:", sessionData);

        if(sessionData.Result.ResultCode !== 0){
            throw new Error(`Login failed, result code: ${sessionData.Result.ResultCode}`);
        }

        const cookies = session.headers["set-cookie"]
        const ucsMatch = cookies[0];
        const extMatch = cookies[1];

        //console.log(cookies)

        if (!ucsMatch || !extMatch) {
            throw new Error("Missing authentication cookies from login response");
        }
        
        const cookies_string = `${ucsMatch}; ${extMatch}`;
        return cookies_string
    }catch(e){
        console.error(e)
        throw new Error("Gate API Authentication Failed");
    }
}