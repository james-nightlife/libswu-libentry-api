import ldap from 'ldapjs-promise'  
import jwt from 'jsonwebtoken'; 

const authenticateUser = async (req, res, next) => {
    var response = {};

    try{
        if (!req.body) {
            throw new Error("No Body");
        }
        const inputs = req.body;

        if (!inputs.username || !inputs.password) {
            throw new Error("Missing required fields");
        }

        let uid = `uid=${inputs.username}, dc=swu, dc=ac, dc=th`;
        let pwd = inputs.password;

        const ldapClient = ldap.createClient({
            url: "ldap://ldap.swu.ac.th",
        });

        await ldapClient.bind(uid, pwd);

        const payload = {
            sub: inputs.username,
            iat: Math.floor(Date.now() / 1000),
        }

        const SECRET = "USER_SECRET_KEY";
        const token = jwt.sign(payload, SECRET, { expiresIn: '3h' });

        response = {
            'token': token
        };

        res.json(response);

    }catch(err){
        next(err);
    }
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