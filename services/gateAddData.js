const gateAddData = async (cookies_string, user_id, unique_id, firstname = '', middlename = '', lname = '') => {
    const now = new Date();
    const createDate = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, 0)}-${(now.getDate()).toString().padStart(2, 0)} ${(now.getHours()).toString().padStart(2, 0)}:${(now.getMinutes()).toString().padStart(2, 0)}:${(now.getSeconds()).toString().padStart(2, 0)}`;
    const expireDate = `${parseInt(startDate.substring(0, 4)) - 543 + 42}-09-30 23:59:59`;
    // Create the user in the gate system using the new ID and user information
    const create_user = await fetch(
        `${process.env.GATE_API_URL}/v1/users?UserID=${user_id}`, 
        {
            method: 'POST',
            headers: { 
                'Cookie': cookies_string,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                "UserInfo": {
                    "ID": user_id,
                    "UniqueID": unique_id,
                    "Name": `${firstname} ${middlename} ${lastname}`,
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
                    "GroupCode": 4000,
                    "AccessGroupCode": 5605,
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
                    "Department": "บุคคลภายนอก",
                    "LoginPW": "",
                    "LoginAllowed": 0,
                    "Picture": "",
                    "EmployeeNum": "",
                    "Email": "",
                    "Phone": "",
                },
                "UserCardInfo": [
                    {
                    "CardNum": user_id.toString(),
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
}