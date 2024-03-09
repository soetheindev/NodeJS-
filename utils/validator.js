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

            if (!req.headers.authorization) {
                next("Tokenization Error");
                return;
            }

            let token = req.headers.authorization?.split(" ")?.[1];

            if (token) {

                let decoded = jwt.verify(token, process.env.SECRET_KEY);

                if (decoded) {
                    let user = await Helper.get(decoded._id);

                    if (user) {
                        req.user = user;
                        next();
                    }else {
                        next("Tokenization Error");
                    }

                }else {
                    next("Tokenization Error");
                }
            } else {
                next("Tokenization Error");
            }
        }
    },
    validateRole: (role) => {
        return async (req, res, next) => {
          let foundRole = req.user.roles.find(ro => ro.name == role)
          if (foundRole) {
            next();
          }else {
            next(new Error("You don't have this permission"));
          }
        }
    }
}