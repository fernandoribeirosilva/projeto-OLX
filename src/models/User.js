const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const modelSchema = new mongoose.Schema({
   name: String,
   email: String,
   passwordHash: String,
   token: String,
   state: String
});

const modelName = 'User';

// se tiver este model usar ele, se não cria um com o nome de modelName
if (mongoose.connection && mongoose.connection.model[modelName]) {
   module.exports = mongoose.connection.model[modelName];
} else {
   module.exports = mongoose.model(modelName, modelSchema);
}