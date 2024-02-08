const DB = require('../models/role');
const PermitDB = require('../models/permit');
const Helper = require('../utils/helper');


const all = async (req, res, next) => {
    let dbRole = await DB.find().populate('permits','-__v');
    if (dbRole) {
        Helper.fMsg(res, "All roles", dbRole);
    }else{
        next(new Error("No roles found"));
    }
}

const get = async (req, res, next) => {
    let dbRole = await DB.findById(req.params.id).select('-__v');;
    if (dbRole) {
        Helper.fMsg(res, "Single Role", dbRole);
    }else{
        next(new Error("No role with that id found"));
    }
}

const add = async (req, res, next) => {
    let dbRole = await DB.findOne({ name: req.body.name });
    if (dbRole) {
        next(new Error("Role name already in use"));
    }else{
        let result = await new DB(req.body).save();
        Helper.fMsg(res, "New Role added", result);
    }
};

const patch = async (req, res, next) => {

    console.log("Welcome from patch");

    let dbRole = await DB.findById(req.params.id).select('-__v');
    if (dbRole) {
        await DB.findByIdAndUpdate(dbRole._id, req.body);
        let updateRole = await DB.findById(dbRole._id).select('-__v');
        Helper.fMsg(res, "Role updated", updateRole);
    }else {
        next(new Error("No Role with that id"));
    }
};

const drop = async(req, res, next) => {
    let dbRole = await DB.findById(req.params.id).select('-__v');
    if (dbRole) {
        await DB.findByIdAndDelete(dbRole._id);
        Helper.fMsg(res, "Role Deleted")
    }else{
        next(new Error("No Role with that id"));
    }
};

const roleAddPermit = async(req, res, next) =>{
    let dbRole = await DB.findById(req.body.roleId);
    let dbPermit = await PermitDB.findById(req.body.permitId);

    if (dbRole && dbPermit) {
        let result = await DB.findByIdAndUpdate(dbRole._id, {$push:{permits:dbPermit._id}});
        let permitAddedData = await DB.findById(result._id).populate('permits');
        Helper.fMsg(res, 'Permit added to the Role', permitAddedData);
    }else{
        next(new Error("Role Id and Permit Id need to be valided!"));
    }
};

const roleRemovePermit = async(req, res, next) => {
    let dbRole = await DB.findById(req.body.roleId);
    let dbPermit = await PermitDB.findById(req.body.permitId);

    if ( dbRole && dbPermit) {
        let result = await DB.findByIdAndUpdate(dbRole._id, {$pull:{permits: dbPermit._id}});
        let roleRemovePermit = await DB.findById(dbRole._id);
        Helper.fMsg(res, "Role remove permission", roleRemovePermit);
    }else {
        next(new Error("Role Id & Permit Id need to be valided!"));
    }
};

module.exports = {
    all,
    get,
    patch,
    drop,
    add,
    roleAddPermit,
    roleRemovePermit,
}
