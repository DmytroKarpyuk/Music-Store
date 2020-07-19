module.exports = function Cart(oldCart) {
    this.items = oldCart.items || {}
    this.totalQty = oldCart.totalQty || 0
    this.totalPrice = oldCart.totalPrice || 0

    this.add = (item, id) => {
        let storedItem = this.items[id]
        if (!storedItem) {
            storedItem = this.items[id] = { item: item, qty: 0, price: 0 }
        }
        storedItem.qty++
        storedItem.price = storedItem.item.price * storedItem.qty
        this.totalQty++
        this.totalPrice += storedItem.item.price
    }

    this.generateArray = () => {
        let arr = []
        for (let id in this.items) {
            arr.push(this.items[id])
        }
        return arr
    }
}



// const { Schema, model } = require('mongoose')

// const cart = new Schema(
//     {
//         userId: {
//             type: Schema.Types.ObjectId,
//             ref: "User"
//         },
//         products: [
//             {
//                 productId: Number,
//                 quantity: Number,
//                 name: String,
//                 price: Number
//             }
//         ],
//         active: {
//             type: Boolean,
//             default: true
//         },
//         modifiedOn: {
//             type: Date,
//             default: Date.now
//         }
//     },
//     { timestamps: true }
// );

// module.exports = model('Cart', cart)