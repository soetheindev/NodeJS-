const jwt = require('jsonwebtoken');
const Helper = require('./helper');

module.exports = {
    validateBody:(schema) => {
        return (req, res, next) => {
            let result = schema.validate(req.body);
            if (result.error){
                next(new Error(result.error.details[0].message));
            }else{
                next();
            }
        }
    },
    validateParam: (schema, name) => {
        return (req, res, next) => {
            let obj = {};
            obj[`${name}`] = req.params[`${name}`];
            let result = schema.validate(obj);
            if (result.error){
                next(new Error(result.error.details[0].message));
            }else{
                next();
            }
        }
    },
    validateToken: () => {
        return async (req, res, next) => {
            let token = req.headers.authorization?.split(" ")?.[1];
            let decoded = jwt.verify(token, process.env.SECRET_KEY);
            
            console.log("Token =>", token );
            console.log("Key =>", process.env.SECRET_KEY);
            console.log("Decoded =>", decoded);


            if (decoded) {
                let user = await Helper.get(decoded._id);
                if (user) {
                    req.user = user;
                }else {
                    next(new Error("Invalid token"));
                }
            }else {
                next(new Error("Invalid Token"));
            }
        }
    }
}