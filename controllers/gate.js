const getGateUser = async (req, res, next) => {
    var response = {};
    const start_time = performance.now();

    try{
        const ip = req.ip.replace('::ffff:', '');

        if(!(ip.startsWith('10.') || (ip === '::1'))){
            throw new Error("Unauthorized Access");
        }

        // Validate query parameters
        if(Object.keys(req.query).length === 0 || !req.query.userid){
            throw new Error('Missing required fields');
        }
        const input = req.query;

        const session = await fetch(`${process.env.GATE_API_URL}/v1/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "userId": process.env.GATE_USERID,
                "password": process.env.GATE_PASSWORD,
                "userType": 0
            }),
        });
        //console.log("Login Response:", session);
        // Check if login was successful
        if(session.status !== 200){
            throw new Error(`Login request failed with status: ${session.status}`);
        }
        const sessionData = await session.json();
        //console.log("Session Data:", sessionData);
        // Check if login was successful
        if(sessionData.Result.ResultCode !== 0){
            throw new Error(`Login failed, result code: ${sessionData.Result.ResultCode}`);
        }
        
        const cookies = session.headers.get('set-cookie');
        //console.log("Set-Cookie Header:", cookies);
        const ucsMatch = cookies?.match(/ucsinfo=[^;]+/);
        const extMatch = cookies?.match(/extinfo=[^;]+/);
        //console.log("UCS Match:", ucsMatch);
        //console.log("EXT Match:", extMatch);
        // Ensure both cookies are found
        if (!ucsMatch || !extMatch) {
            throw new Error("Missing authentication cookies from login response");
        }
        const cookies_string = `${ucsMatch[0]}; ${extMatch[0]}`;

        const users = await fetch(`${process.env.GATE_API_URL}/v1/users?groupID=0&subInclude=true&offset=0&limit=10000&searchKeyword=${input.userid}&searchCategory=uniqueid`, {
            method: 'GET',
            headers: { 
                'Cookie': cookies_string 
            },
        });
        
        //console.log("Get Users Response:", users);
        // Check if get users was successful
        if(!users.status === 200){
            throw new Error(`Get users request failed with status: ${users.status}`);
        }
        const usersData = await users.json();
        //console.log("Users Data:", usersData);
        // Check if get users was successful
        if(usersData.Result.ResultCode !== 0){
            throw new Error(`Get users failed, result code: ${usersData.Result.ResultCode}`);
        }
        const userlist = usersData.UserList;
        const user = userlist.find(u => u.UniqueID === input.userid);
        // If user not found, return 404
        if(!user){
            throw new Error('User not found');
        }
        const processing_time = performance.now() - start_time;
        //console.log(`Processing time: ${processing_time} ms`);
        response = { 
            processing_time, 
            user 
        };
        res.json(response);
    }catch(error){
        next(error);
    }
}

export { getGateUser };