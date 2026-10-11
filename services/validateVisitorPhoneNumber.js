import { ValidationError } from "./exceptions.js";

export const validateVisitorPhoneNumber = async (phone_number) => {
    if(!/(^[0-9]{9,}$)/.test(phone_number)){
            throw new ValidationError('กรุณาระบุหมายเลขโทรศัพท์มือถือของท่านที่ความยาว 9 ตัวขึ้นไป และไม่มีสัญลักษณ์หรือเครื่องหมายใดๆ\nPlease enter your mobile number with 9 digits onward and without any symbols.');
    }
}