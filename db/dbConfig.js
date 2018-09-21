const mongoose = require(`mongoose`);
mongoose.Promise = global.Promise;

const db = mongoose
  .connect(
    process.env.MONGODB_URI || `mongodb://localhost:27017/SingInDev`,
    { useNewUrlParser: true }
  )
  .then(() => console.log(`Database has been Connected successfully`))
  .catch(err => console.log(err));

module.exports = {
  db
};
