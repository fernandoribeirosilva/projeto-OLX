const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const modelSchema = new mongoose.Schema({
   name: String,
   slug: String
});

const modelName = 'Category';

// se tiver este model usar ele, se não cria um com o nome de modelName
if (mongoose.connection && mongoose.connection.model[modelName]) {
   module.exports = mongoose.connection.model[modelName];
} else {
   module.exports = mongoose.model(modelName, modelSchema);
}