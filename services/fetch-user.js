export const fetchUser = async (username) => {
    // If username matches student pattern
    if(username.match(/^[a-z]{2}[0-9]{9}$/)){
        const request = await fetch(`${process.env.SWU_API_URL}/StudentSwu/${username}`, {
            method: 'POST',
            headers: {
                'x-api-key': process.env.API_KEY
            }
        })

        // Check if response is not 200
        if(request.status !== 200){
            throw new Error('Failed to fetch user data');
        }

        const response = await request.json();

        const student_filter = response.filter(item => item.buasri_id === username);

        // If found in students
        if(student_filter.length > 0){
            return {
                buasri_id: student_filter[0].buasri_id,
                user_id: student_filter[0].student_id, 
                name_th: student_filter[0].name_th, 
                lname_th: student_filter[0].lname_th,
                name_en: student_filter[0].name_en, 
                lname_en: student_filter[0].lname_en,
                department_th: student_filter[0].major_th,
            };
        }else{
            throw new Error('User not found');
        }
    }else{
        const active_request = await fetch(`${process.env.SWU_API_URL}/EmployeeSwuActive/${username}`, {
            method: 'POST',
            headers: {
                'x-api-key': process.env.API_KEY
            }
        })
        // Check if response is not 200
        if(active_request.status !== 200){
            throw new Error('Failed to fetch user data');
        }
        const active_response = await active_request.json();
        const active_response_filter = active_response.filter(item => item.buasri_id === username);
        // If found in active employees
        if(active_response_filter.length > 0){
            return {
                buasri_id: active_response_filter[0].buasri_id,
                user_id: active_response_filter[0].employee_id, 
                name_th: active_response_filter[0].name_th, 
                lname_th: active_response_filter[0].lname_th,
                name_en: active_response_filter[0].name_en,
                lname_en: active_response_filter[0].lname_en,
                department_th: active_response_filter[0].department_th,
            };
        }else{
            const not_active_request = await fetch(`${process.env.SWU_API_URL}/EmployeeSwuNotActive/${username}`, {
            method: 'POST',
                headers: {
                    'x-api-key': process.env.API_KEY
                }
            })
            // Check if response is not 200
            if(not_active_request.status !== 200){
                throw new Error('Failed to fetch user data');
            }
            const not_active_response = await not_active_request.json();
            const not_active_response_filter = not_active_response.filter(item => item.buasri_id === username);  
            if(not_active_response_filter.length > 0){
                const not_active_response_sorted = not_active_response_filter.sort((a, b) => {
                    return b.employee_id - a.employee_id;
                });
                return {
                    buasri_id: not_active_response_sorted[0].buasri_id,
                    user_id: not_active_response_sorted[0].employee_id, 
                    name_th: not_active_response_sorted[0].name_th, 
                    lname_th: not_active_response_sorted[0].lname_th, 
                    name_en: not_active_response_sorted[0].name_en, 
                    lname_en: not_active_response_sorted[0].lname_en,
                    department_th: active_response_filter[0].department_th,
                };
            }else{
                throw new Error('User not found');
            }
            }
        }       
}