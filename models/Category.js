const { Schema, model } = require('mongoose')

const category = new Schema({
    idCat: {
        type: Number,
        require: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String
    }
})

module.exports = model('Category', category, 'category_list')