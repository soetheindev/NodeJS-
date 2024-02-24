require('dotenv').config();
const express = require('express'),
    app = express(),
    mongoose = require('mongoose');

const { migrate } = require('./migrations/migrator');

mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.DbName}`)

app.use(express.json());

const permitRouter = require('./routes/permit');
const roleRouter = require('./routes/role');
const userRouter = require('./routes/user');

app.use('/permits', permitRouter);
app.use('/roles', roleRouter);
app.use('/users', userRouter);

app.use((err, req, res, next) => {

    console.log("Error =>", err);
    
    if(typeof(err) === 'string')
    {
        err = { "status": 500, "message": err };
    }

   res.status(err.status).json({con: false, msg: err.message});
})

const defaultData = async () => {
    let migrator = require('./migrations/migrator');
    // migrator.migrate();
    // migrator.backup();
    migrator.rpMigrate();
}

defaultData();

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})