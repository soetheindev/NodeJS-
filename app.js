require('dotenv').config();
const express = require('express'),
    app = express(),
    mongoose = require('mongoose');

const { migrate } = require('./migrations/migrator');

mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.DbName}`)

app.use(express.json());

const permitRouter = require('./routes/permit');
const roleRouter = require('./routes/role');

app.use('/permits', permitRouter);
app.use('/roles', roleRouter);

app.use((err, req, res, next) => {
    err.status = err.status || 500;
   res.status(err.status).json({con: false, msg: err.message});
})

const defaultData = async () => {
    let migrator = require('./migrations/migrator');
    // migrator.migrate();
    migrator.backup();
}

defaultData();

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})