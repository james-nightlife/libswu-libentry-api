import jwt from 'jsonwebtoken'; 
import { fetchUser } from '../services/fetch-user.js';
import { passwordSave } from '../services/password-save.js';
import { passwordValidate } from '../services/password-validation.js';
import { authenticate } from 'ldap-authentication';
import { gateValidation } from '../services/gateValidation.js';

export const authenticateUser = async (req, res, next) => {
    const { username, password, service } = req.body;
    
    if (!username || !password) { // Check if username or password is missing
        console.error('Authentication error: Missing username or password');
        return res.status(400).json({
            message: 'Bad Request: Missing username or password'
        });
    }

    let uid = `uid=${username}, dc=swu, dc=ac, dc=th`;
    let pwd = password;

    try{
        const authenticated = await authenticate({
            ldapOpts: {
                url: 'ldap://ldap.swu.ac.th',
            },
            userDn: uid,
            userPassword: pwd,
            attribute: [],
        })
        //console.log('LDAP authentication successful:', authenticated);
        await passwordSave(username, password);
    }catch(err){
        if(err.name === 'LdapAuthenticationError' && err.message === ' Code: 0x31') { // LDAP authentication failed due to invalid credentials
            return res.status(401).json({
                message: 'Unauthorized: Invalid username or password'
            });
        }
        const isValid = await passwordValidate(username, password); // Check if the provided credentials are valid in the local database
        if (!isValid) {
            return res.status(401).json({
                message: 'Unauthorized: Invalid username or password'
            });
        }
    }

    const response = {}

    if(service === 'gate'){
        const user = await fetchUser(username);
        //console.log("Fetched User:", user);
        response.user = user;
        response.gate = await gateValidation(user);
    }

    if(service === 'visitor_admin'){
        if(['sutthiphong', 'isaya', 'siwapornc', 'nairat', 'songyot'].includes(username)){
            response.role = 'admin';
        }
    }

    const payload = {
        username: username
    }

    const SECRET = process.env.JWT_SECRET;
    const token = jwt.sign(payload, SECRET, { expiresIn: '3h' });

    response.token = token;
    
    res.json(response);
}

export const authCheck = async (req, res, next) => {
    const { decoded } = req.body;
    console.log(decoded)
    return res.json({
        message: 'Authenticated successfully'
    });
}