export const gateValidation = async (user) => {
    try{

        const now = new Date();
        const createDate = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, 0)}-${(now.getDate()).toString().padStart(2, 0)} ${(now.getHours()).toString().padStart(2, 0)}:${(now.getMinutes()).toString().padStart(2, 0)}:${(now.getSeconds()).toString().padStart(2, 0)}`;
        const startDate = user.type === 'student' ? user.admission_date : user.start_date || createDate;
        const expireDate = user.type === 'student' ? `${parseInt(startDate.substring(0, 4)) - 543 + 4}-${startDate.substring(4, 6)}-${startDate.substring(6, 8)} 23:59:59` : `${parseInt(startDate.substring(0, 4)) - 543 + 42}-09-30 23:59:59`;
        
        console.log("Create Date:", createDate);
        console.log("Start Date:", startDate);
        console.log("Expire Date:", expireDate);
        // Login to the gate system
        const session = await fetch(
            `${process.env.GATE_API_URL}/v1/login`, 
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "userId": process.env.GATE_USERID,
                    "password": process.env.GATE_PASSWORD,
                    "userType": 0
                }),
            }
        );

        if(session.status !== 200){
            throw new Error(`Login request failed with status: ${session.status}`);
        }

        const sessionData = await session.json();
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

        // Fetch the user from the gate system using the provided user_id
        const users = await fetch(`${process.env.GATE_API_URL}/v1/users?groupID=0&subInclude=true&offset=0&limit=10000&searchCategory=uniqueid&searchKeyword=${user.user_id}`, {
            method: 'GET',
            headers: { 
                'Cookie': cookies_string 
            },
        });

        if(users.status !== 200){
            throw new Error(`Get users request failed with status: ${users.status}`);
        }

        const usersData = await users.json();
        //console.log("Users Data:", usersData);

        if(usersData.Result.ResultCode !== 0){
            throw new Error(`Get users failed, result code: ${usersData.Result.ResultCode}`);
        }
        const userlist = usersData.UserList;
        const user_found = userlist.find(u => u.UniqueID == user.user_id);
        if(!user_found){
            // If user not found, create the user in the gate system
            const new_id = await fetch(`${process.env.GATE_API_URL}/v1/users/initUserInfo`, {
                method: 'GET',
                headers: { 
                    'Cookie': cookies_string 
                },
            });

            if(new_id.status !== 200){
                throw new Error(`Get user ID request failed with status: ${new_id.status}`);
            }

            const new_id_data = await new_id.json();
            //console.log("New ID Data:", new_id_data);
            if(new_id_data.Result.ResultCode !== 0){
                throw new Error(`Get user ID failed, result code: ${new_id_data.Result.ResultCode}`);
            }

            
            // Create the user in the gate system using the new ID and user information
            const create_user = await fetch(`${process.env.GATE_API_URL}/v1/users?UserID=${new_id_data.dmUserInfo.ID}`, {
            method: 'POST',
            headers: { 
                'Cookie': cookies_string,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                "UserInfo": {
                    "ID": new_id_data.dmUserInfo.ID,
                    "UniqueID": user.user_id.toString(),
                    "Name": `${user.name_th} ${user.lname_th}`,
                    "AuthInfo": [
                    30,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                    ],
                    "Privilege": 2,
                    "CreateDate": createDate,
                    "UsePeriodFlag": 0,
                    "RegistDate": createDate,
                    "ExpireDate": expireDate,
                    "Password": "",
                    "GroupCode": 1000,
                    "AccessGroupCode": user.type === 'student' ? 1000 : 3000,
                    "UserType": 0,
                    "TimezoneCode": 0,
                    "BlackList": 0,
                    "FPIdentify": 0,
                    "FaceIdentify": 0,
                    "DuressFinger": null,
                    "Partition": 0,
                    "APBExcept": 0,
                    "APBZone": 0,
                    "WorkCode": "0",
                    "MealCode": "0",
                    "MoneyCode": "0",
                    "MessageCode": 0,
                    "VerifyLevel": 0,
                    "PositionCode": 0,
                    "Department": user.department_th || "",
                    "LoginPW": "",
                    "LoginAllowed": 0,
                    "Picture": "",
                    "EmployeeNum": "",
                    "Email": "",
                    "Phone": "",
                },
                "UserCardInfo": [
                    {
                    "CardNum": user.user_id.toString(),
                    }
                ],
                })
        });
        if(create_user.status !== 200){
            throw new Error(`Get users request failed with status: ${users.status}`);
        }
        const createUserData = await create_user.json();
        //console.log("Create User Data:", createUserData);
        if(createUserData.Result.ResultCode !== 0){
            throw new Error(`Create user failed, result code: ${createUserData.Result.ResultCode}`);
        }

        return 
    }

    }catch(err){
        console.error('Gate validation error:', err);
        throw new Error('Gate validation failed');
    }
}