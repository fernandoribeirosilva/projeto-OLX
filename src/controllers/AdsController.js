const { v4: uuid } = require('uuid');
const jimp = require('jimp');

const Category = require('../models/Category');
const User = require('../models/User');
const Ad = require('../models/Ad');
const State = require('../models/State');
const mongoose = require('mongoose');

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
         const cats = await Category.find();

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
      let { sort = 'asc', offset = 0, limit = 8, query, category, state } = req.query;
      let filters = { status: true };
      let total = 0;

      if (query) {
         filters.title = { '$regex': query, '$options': 'i' };
      }

      if (category) {
         const hasCategory = await Category.findOne({ slug: category });
         if (hasCategory) {
            filters.category = hasCategory._id.toString();
         }
      }

      if (state) {
         const hasState = await State.findOne({ name: state.toUpperCase() });
         if (hasState) {
            filters.state = hasState._id.toString();
         }
      }

      const adsTotal = await Ad.find(filters);
      total = adsTotal.length;

      const adsData = await Ad.find(filters)
         .sort({ dateCreated: (sort === 'desc' ? -1 : 1) })
         .skip(parseInt(offset))
         .limit(parseInt(limit));

      let ads = [];
      for (let i in adsData) {
         let image;

         let defaultImg = adsData[i].images.find(img => img.default === true);
         if (defaultImg) {
            image = `${process.env.BASE_URL}/assets/media/ad/${defaultImg.url}`;
         } else {
            image = `${process.env.BASE_URL}/assets/media/ad/default.jpg`;
         }

         ads.push({
            id: adsData[i]._id,
            title: adsData[i].title,
            price: adsData[i].price,
            priceNegotiable: adsData[i].priceNegotiable,
            image
         });
      }

      res.status(200).json({ ads, total });
   },

   getItem: async (req, res) => {
      let { id, other = null } = req.query;
      let ad = '';

      if (!id) {
         res.status(400).json({ error: 'Sem produto.' });
         return;
      }

      if (mongoose.Types.ObjectId.isValid(id)) {
         ad = await Ad.findById(id);
         if (!ad) {
            res.status(400).json({ error: 'Produto inexistente.' });
            return;
         }
      } else {
         res.status(400).json({ error: 'Id inválido' });
         return;
      }

      ad.views++;
      await ad.save();

      let images = [];
      for (let i in ad.images) {
         images.push(`${process.env.BASE_URL}/assets/media/ad/${ad.images[i].url}`);
      }

      let category = await Category.findById(ad.category);
      let userInfo = await User.findById(ad.idUser);
      let stateInfo = await State.findById(ad.state);

      let others = [];
      if (other) {
         const otherData = await Ad.find({ status: true, idUser: ad.idUser });

         for (let i in otherData) {
            if (otherData[i]._id.toString() !== ad._id.toString()) {
               let image = `${process.env.BASE_URL}/assets/media/ad/default.jpg`;

               let defaultImg = otherData[i].images.find(img => img.default === true);
               if (defaultImg) {
                  image = `${process.env.BASE_URL}/assets/media/ad/${defaultImg.url}`;
               }

               others.push({
                  id: otherData[i]._id,
                  title: otherData[i].title,
                  price: otherData[i].price,
                  priceNegotiable: otherData[i].priceNegotiable,
                  image
               });
            }
         }
      }

      res.json({
         id: ad._id,
         title: ad.title,
         price: ad.price,
         priceNegotiable: ad.priceNegotiable,
         description: ad.description,
         dateCreated: ad.dateCreated,
         views: ad.views,
         images,
         category,
         userInfo: {
            name: userInfo.name,
            email: userInfo.email
         },
         stateName: stateInfo.name,
         others
      });
   },

   editAction: async (req, res) => {

   },
}