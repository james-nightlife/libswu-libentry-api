import axios from "axios";

export const gateAddData = async (cookies_string, user_id, unique_id, firstname = '', middlename = '', lastname = '', department = '', groupCode=4000, accessGroupCode=5605) => {
    console.log(cookies_string, typeof(cookies_string))
    console.log(user_id, typeof(user_id))
    //console.log(Number(user_id), typeof(Number(user_id)))
    console.log(unique_id, typeof(unique_id))
    console.log(firstname, typeof(firstname))
    console.log(middlename, typeof(middlename))
    console.log(lastname, typeof(lastname))
    console.log(department, typeof(department))
    console.log(groupCode, typeof(groupCode))
    console.log(accessGroupCode, typeof(accessGroupCode))



    try{
        const now = new Date();
        const createDate = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, 0)}-${(now.getDate()).toString().padStart(2, 0)} ${(now.getHours()).toString().padStart(2, 0)}:${(now.getMinutes()).toString().padStart(2, 0)}:${(now.getSeconds()).toString().padStart(2, 0)}`;
        const startDate = createDate;
        const expireDate = `${parseInt(startDate.substring(0, 4)) + 42}-09-30 23:59:59`;
        console.log(createDate)
        console.log(expireDate)
        // Create the user in the gate system using the new ID and user information
        const create_user = await axios.post(
        `${process.env.GATE_API_URL}/v1/users?UserID=${user_id}`, 
        {
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
                    "GroupCode": groupCode,
                    "AccessGroupCode": accessGroupCode,
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
                    "Department": department,
                    "LoginPW": "",
                    "LoginAllowed": 0,
                    "Picture": "",
                    "EmployeeNum": "",
                    "Email": "",
                    "Phone": "",
                },
                "UserCardInfo": [
                    {
                    "CardNum": unique_id,
                    }
                ],
            },
        {
            headers: { 
                'Cookie': cookies_string,
                'Content-Type': 'application/json' 
            }
        })

        const createUserData = await create_user.data;

        if(createUserData.Result.ResultCode !== 0){
            throw new Error(`Create user failed, result code: ${createUserData.Result.ResultCode}`);
        }
    }catch(e){
        console.error(e)
        throw Error('Insert User Data into Gate System Failed')

    }
 }