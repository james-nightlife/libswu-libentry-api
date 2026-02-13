import ldap from 'ldapjs-promise'  
import jwt from 'jsonwebtoken'; 
import { fetchUser } from '../services/fetch-user.js';

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

    let userData;

    /* Try to bind to LDAP server */
    try{
        await ldapClient.bind(uid, pwd);
        userData = await fetchUser(inputs.username);
    }catch(err){
        // If invalid credentials
        if(err instanceof ldap.InvalidCredentialsError){
            res.status(401).json({
                'message': 'Unauthorized: Invalid username or password'
            });
            return;
        }else if(err.message === 'User not found'){
            res.status(403).json({
                'message': 'User not found in database'
            }); 
            return;
        }else{
            res.status(500).json({
                'message': 'Internal Server Error: LDAP connection failed'
            });
            return;
        }
    }

    const payload = {
        sub: inputs.username,
        iat: Math.floor(Date.now() / 1000),
    }

    const SECRET = process.env.JWT_SECRET;
    const token = jwt.sign(payload, SECRET, { expiresIn: '3h' });
    
    res.json({
        token: token,
        user: userData
    });
}

const authCheck = (req, res, next) => {
    try{
        if (!req.headers['authorization']) {
            throw new Error("Missing Authorization Header");
        }
        const authHeader = req.headers['authorization'];
        jwt.verify(authHeader, "USER_SECRET_KEY");
        res.status(200).json({
            'message': 'Authorized'
        });
    }catch(err){
        res.status(401).json({
            'message': err.message
        });
    }finally{

    }
}

export { authenticateUser, authCheck };