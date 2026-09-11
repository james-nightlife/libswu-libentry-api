import jwt from 'jsonwebtoken'; 

export const tokenCheck = async (req, res, next) => {
    const token = req.headers['authorization'];
    //console.log('Received token:', req.body);
    //console.log('Received token:', token);
    
    if(!token){
        return res.status(400).json({
            'message': 'Bad Request: Missing token'
        });
    }

    try {
        req.params.decoded = jwt.verify(token, process.env.JWT_SECRET);
        next();
    }catch(err){
        console.error('JWT verification error:', err);
        if(err.name === 'JsonWebTokenError'){
            return res.status(401).json({
                'message': 'Unauthorized: Invalid token'
            });
        }
        if(err.name === 'TokenExpiredError'){
            return res.status(401).json({
                'message': 'Unauthorized: Token has expired'
            });
        }
        return res.status(401).json({
            'message': 'Unauthorized: Token verification failed'
        });
    }
}