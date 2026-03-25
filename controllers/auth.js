import ldap from 'ldapjs-promise'  
import jwt from 'jsonwebtoken'; 
import { fetchUser } from '../services/fetch-user.js';
import { passwordSave } from '../services/password-save.js';
import { passwordValidate } from '../services/password-validation.js';

export const authenticateUser = async (req, res, next) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        console.error('Authentication error: Missing username or password');
        return res.status(400).json({
            message: 'Bad Request: Missing username or password'
        });
    }

    let uid = `uid=${username}, dc=swu, dc=ac, dc=th`;
    let pwd = password;
    const ldapClient = ldap.createClient({
        url: "ldap://ldap.swu.ac.th",
    });

    ldapClient.on('error', async (err) => {
        console.error('LDAP connection error:', err);
        const isValid = await passwordValidate(username, password);
        if (!isValid) {
            return res.status(401).json({
                'message': 'Unauthorized: Invalid username or password'
            });
        }
    });
    
    try{
        await ldapClient.bind(uid, pwd);
        await passwordSave(username, password);
    }catch(err){
        console.error('LDAP authentication error:', err);
        if (err.name === 'InvalidCredentialsError') {
            return res.status(401).json({
                'message': 'Unauthorized: Invalid username or password'
            });
        }else{
            return res.status(500).json({
                'message': 'Internal Server Error: LDAP authentication failed'
            });
        }
    }

    const payload = {
        username: username
    }

    const SECRET = process.env.JWT_SECRET;
    const token = jwt.sign(payload, SECRET, { expiresIn: '3h' });
    
    res.json({
        token: token,
    });
}

export const authCheck = async (req, res, next) => {
    const { decoded } = req.body;
    console.log(decoded)
    return res.json({
        message: 'Authenticated successfully'
    });
}