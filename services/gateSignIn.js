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

        const cookies = session.headers.get('set-cookie');
        const ucsMatch = cookies?.match(/ucsinfo=[^;]+/);
        const extMatch = cookies?.match(/extinfo=[^;]+/);

        if (!ucsMatch || !extMatch) {
            throw new Error("Missing authentication cookies from login response");
        }
        
        const cookies_string = `${ucsMatch[0]}; ${extMatch[0]}`;
        return cookies_string
    }catch(e){
        throw new Error("Gate API Authentication Failed");
    }
}