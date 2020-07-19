const { Schema, model } = require('mongoose')

const product = new Schema({
    name: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String
    },
    category: {
        type: Number
    }
})

module.exports = model('Product', product, 'goods_list')