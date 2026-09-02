export const validateVisitorPhoneNumber = async (phone_number) => {
    if(phone_number.length < 9){
            throw new Error('Phone Number is too short');
        }
    }