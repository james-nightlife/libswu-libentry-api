export const validateVisitorPhoneNumber = async (phone_number) => {
    if(phone_number.length < 9){
            throw new Error('หมายเลขโทรศัพท์มือถือไม่ครบถ้วน');
        }
    }