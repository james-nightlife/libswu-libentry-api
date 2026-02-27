import ldap from 'ldapjs-promise'  
import jwt from 'jsonwebtoken'; 
import { fetchUser } from '../services/fetch-user.js';
import { passwordSave } from '../services/password-save.js';
import { passwordValidate } from '../services/password-validation.js';

const authenticateUser = async (req, res, next) => {
    // If no body
    if (!req.body) {
        res.status(400).json({
            'message': 'Bad Request: No data provided'
        });
        return;
    }
    const inputs = req.body;
    
    // If missing username or password
    if (!inputs.username || !inputs.password) {
        res.status(400).json({
            'message': 'Bad Request: Missing username or password'
        });
        return;
    }

    let uid = `uid=${inputs.username}, dc=swu, dc=ac, dc=th`;
    let pwd = inputs.password;
    const ldapClient = ldap.createClient({
        url: "ldap://ldap.swu.ac.th",
    });
    
    /* Try to bind to LDAP server */
    try{
        await ldapClient.bind(uid, pwd);
        await passwordSave(inputs.username, inputs.password);
    }catch(err){
        // If invalid credentials
        if(err instanceof ldap.InvalidCredentialsError){
            res.status(401).json({
                'message': 'Unauthorized: Invalid username or password'
            });
            return;
        }else if(err instanceof ldap){
            const isValid = await passwordValidate(inputs.username, inputs.password);
            if (!isValid) {
                res.status(401).json({
                    'message': 'Unauthorized: Invalid username or password'
                });
                return;
            }
        }else{
            console.error('LDAP error:', err);
            res.status(500).json({
                'message': err.message
            });
            return;
        }
    }

    const payload = {
        username: inputs.username
    }

    const SECRET = process.env.JWT_SECRET;
    const token = jwt.sign(payload, SECRET, { expiresIn: '3h' });
    
    res.json({
        token: token,
    });
}

const authCheck = async (req, res, next) => {
    if (!req.headers['api-token']) {
        res.status(401).json({
            'message': 'Unauthorized: No token provided'
        });
        return;
    }
    const authHeader = req.headers['api-token'];
    const decoded = jwt.verify(authHeader, process.env.JWT_SECRET);
    let userData;

    if(!decoded || !decoded.username){
        res.status(401).json({
            'message': 'Unauthorized: Invalid token'
        });
        return;
    }

    try{
        userData = await fetchUser(decoded.username);

        if(!userData){
            res.status(404).json({
                'message': 'User not found'
            });
            return;
        }   
        
    }catch(err){
        res.status(401).json({
            'message': err.message
        });
    }
    
    res.status(200).json({
        'message': 'Authorized',
        'data': userData
    });
}

export { authenticateUser, authCheck };