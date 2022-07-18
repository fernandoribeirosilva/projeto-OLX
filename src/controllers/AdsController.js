const category = require('../models/Category');

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

   },

   getList: async (req, res) => {

   },

   getItem: async (req, res) => {

   },

   editAction: async (req, res) => {

   },
}