const DB = require('../models/user');
const Helper = require('../utils/helper');


const register = async (req, res, next) => {
    let dbEmailUser = await DB.findOne({ email: req.body.email})

    if (dbEmailUser) {
        next( new Error("Email already in use"))
        return;
    }

    let dbPhoneUser = await DB.findOne({ phone: req.body.phone})

    if (dbPhoneUser) {
        next (new Error ("Phone already in use"));
        return;
    }

    req.body.password = Helper.encode(req.body.password);

    let result = await new DB(req.body).save();
    Helper.fMsg(res, "Register Successfully", result);
}

const login = async (req, res, next) => {
    
    let dbUser = await DB.findOne({ phone: req.body.phone }).populate('roles permits').select('-__v');
    
    if (dbUser) {
        if(Helper.comparePass(req.body.password, dbUser.password)){
            let user = dbUser.toObject();
            delete user.password;

            user.token = Helper.makeToken(user);
            
            Helper.set(user._id, user);
            Helper.fMsg(res, "Login Success", user);
        }else{
            next(new Error("Credential Error"));
        }
    }else {
        next ("Credential Error");
    }
}

module.exports = { 
    register,
    login
};


