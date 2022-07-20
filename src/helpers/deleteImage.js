const fs = require('fs');
const path = require('path');

const deleteImage = async (collection) => {
   const imagePath = path.join(__dirname, '..', '..', 'public', 'assets', 'media', 'ad');
   let listImages = fs.readdirSync(imagePath);

   for (let i in collection.images) {
      let image = collection.images[i].url;

      if (image != 'default.jpg') {
         if (listImages.includes(image)) {
            fs.unlinkSync(path.join(imagePath, image));
         }
      }
   }
}

module.exports = deleteImage;