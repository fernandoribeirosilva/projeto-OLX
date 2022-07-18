const { v4: uuid } = require('uuid');
const jimp = require('jimp');

const category = require('../models/Category');
const User = require('../models/User');
const Ad = require('../models/Ad');

// vai verificar se tem um buffer e vai manipular a imagem
const addImage = async (buffer) => {
   const newImage = `${uuid()}.jpg`;
   const tmpImg = await jimp.read(buffer);
   // vai diminuir a imagem proporcionalmente sem distorcer, e vai salvar
   tmpImg.cover(500, 500).quality(80).write(`./public/assets/media/ad/${newImage}`);
   return newImage;
}

module.exports = {
   getCategories: async (req, res) => {
      try {
         const cats = await category.find();

         let categories = [];

         for (let i in cats) {
            categories.push({
               ...cats[i]._doc,
               img: `${process.env.BASE_URL}/assets/images/${cats[i].slug}.png`
            });
         }

         res.json({ categories });
         return;

      } catch (error) {
         res.status(400).json({ error: 'Não tem categorias' });
         return;
      }
   },

   addAction: async (req, res) => {
      let { title, price, priceneg, desc, cat, token } = req.body;
      const user = await User.findOne({ token });

      if (!title || !cat) {
         res.status(400).json({ error: 'Titulo e/ou categoria não foram preenchidos' });
         return;
      }

      if (price) {
         const priceFormatted = parseFloat(price.replace('.', '').replace(',', '.').replace('R$ ', '')).toFixed(2);
         price = priceFormatted;
      } else {
         price = 0;
      }

      const newAd = new Ad();
      newAd.status = true;
      newAd.idUser = user._id;
      newAd.state = user.state;
      newAd.dateCreated = new Date();
      newAd.title = title;
      newAd.category = cat;
      newAd.price = price;
      newAd.priceNegotiable = (priceneg === 'true') ? true : false;
      newAd.description = desc;
      newAd.views = 0;

      if (req.files && req.files.img) {
         // quando for enviado uma imagem
         if (req.files.img.length === undefined) {
            console.log('enviou uma imagem');
            if (['image/png', 'image/jpg', 'image/jpeg'].includes(req.files.img.mimetype)) {
               let url = await addImage(req.files.img.data);
               newAd.images.push({
                  url,
                  default: false
               });
            }
         } else {// quando for enviado mais de uma imagem
            console.log('enviou mais de uma imagem');
            for (let i = 0; i < req.files.img.length; i++) {
               if (['image/png', 'image/jpg', 'image/jpeg'].includes(req.files.img[i].mimetype)) {
                  let url = await addImage(req.files.img[i].data);
                  newAd.images.push({
                     url,
                     default: false
                  });
               }
            };
         }
      }

      if (newAd.images.length > 0) {
         newAd.images[0].default = true;
      }

      const info = await newAd.save();
      res.status(201).json({ id: info._id });
   },

   getList: async (req, res) => {

   },

   getItem: async (req, res) => {

   },

   editAction: async (req, res) => {

   },
}