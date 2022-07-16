const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const modelSchema = new mongoose.Schema({
   idUser: String,
   state: String,
   category: String,
   images: [Object],
   dateCreated: Date,
   title: String,
   price: Number,
   priceNegotiable: Boolean,
   description: String,
   views: Number,
   status: String
});

const modelName = 'Ad';

// se tiver este model usar ele, se não cria um com o nome de modelName
if (mongoose.connection && mongoose.connection.model[modelName]) {
   module.exports = mongoose.connection.model[modelName];
} else {
   module.exports = mongoose.model(modelName, modelSchema);
}