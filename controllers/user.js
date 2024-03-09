const DB = require('../models/user');
const RoleDB = require('../models/role');
const PermitDB = require('../models/permit');
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

const all = async (req, res, next) => {
    let dbUsers = await DB.find();

    if (dbUsers)
    {
        Helper.fMsg(res, "All Users", dbUsers);
    }
}

const addRole = async(req, res, next) => {
    try {
        let dbUser = await DB.findById(req.body.userId);
        let dbRole = await RoleDB.findById(req.body.roleId);
        let foundRole = dbUser.roles.find(rid => rid.equals(req.body.userIid));

        if(foundRole) {
           throw next('Role is already in use');
        } else {
            await DB.findByIdAndUpdate(dbUser._id, {$push: { roles: dbRole._id}});

            let user = await DB.findById(dbUser.id);

            console.log("AAA ==>", user);

            Helper.fMsg(res, "Added Role to User", user);
        }

        
    } catch (error) {
        next(error);
    }
}

const removeRole = async (req, res, next) => {

    let dbUser = await DB.findById(req.body.userId);

    let foundRole = dbUser.roles.find(rid => rid.equals(req.body.roleId));

    if(foundRole){
        await DB.findByIdAndUpdate(dbUser._id, {$pull: { roles: req.body.roleId }});
        Helper.fMsg(res, "Removed Role from User")
    }else{
        next("Role does not exist");
    }
}

const addPermit = async(req, res, next) => {

    try {
        let dbUser = await DB.findById(req.body.userId);
        let dbPermit = await PermitDB.findById(req.body.permitId);
        let foundPermit = dbUser.permits.find(rid => rid.equals(dbPermit._id));

        if(foundPermit) {
           throw next('Permit is already in use');
        } else {
            await DB.findByIdAndUpdate(dbUser._id, {$push: { permits: dbPermit._id}});

            let user = await DB.findById(dbUser.id);

            Helper.fMsg(res, "Added Permit to User", user);
        }

        
    } catch (error) {
        next(error);
    }
}

const removePermit = async (req, res, next) => {

    console.log("Remove Permit");

    let dbUser = await DB.findById(req.body.userId);
    let dbPermit = await PermitDB.findById(req.body.permitId);

    let foundPermit = dbUser.permits.find(pid => pid.equals(dbPermit._id));

    if(foundPermit){
        await DB.findByIdAndUpdate(dbUser._id, { $pull: { permits: dbPermit._id } });
        let updatedUser = await DB.findById(dbUser._id);
        Helper.fMsg(res, "Removed Permit from User", updatedUser);
    } else{
        next("Permit does not exit");
    }
}





module.exports = { 
    register,
    login,
    all,
    addRole,
    removeRole,
    addPermit,
    removePermit,
};


