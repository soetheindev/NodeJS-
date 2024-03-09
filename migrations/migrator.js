const fs = require('fs');                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
const Helper = require('../utils/helper');
const UserDB = require('../models/user');
const RoleDB = require('../models/role');
const PermitDB = require('../models/permit');

const migrate = async () => {
    let data = fs.readFileSync('./migrations/users.json');
    let users = JSON.parse(data);

    users.forEach(async(user) => {
        user.password = Helper.encode(user.password);
        let result = await new UserDB(user).save();
        console.log(result);
    });
}

const rpMigrate = () => {
    let data = fs.readFileSync('./migrations/rp.json');
    let rp = JSON.parse(data);
    console.log("RP =>", rp);

    rp.roles.forEach(async (role) => {
        let roleResult = await new RoleDB(role).save();
        console.log("Role =>", roleResult);
    });

    rp.permits.forEach(async (permit) => {
        let permitResult = await new PermitDB(permit).save();
        console.log("Permit =>", permitResult)
    })
}

const addOwnerRole = async () => {
    let dbOwner = await UserDB.findOne({ phone: "09100100100" });
    let ownerRole = await RoleDB.findOne({ name: "Owner"  });

    await UserDB.findByIdAndUpdate(dbOwner._id, { $push: { roles: ownerRole._id } });
}

const backup = async () => {
    let users = await UserDB.find();
    fs.writeFileSync('./migrations/backups/users.json', JSON.stringify(users));
    console.log("User DB Backuped!");
}


module.exports = {
    migrate,
    rpMigrate,
    backup,
    addOwnerRole,
}