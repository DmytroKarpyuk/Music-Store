const { Router } = require('express')
const router = Router()

const passport = require('passport')
const { ensureAuthenticated } = require('../config/auth')
// Stripe
const stripe = require('stripe')('sk_test_51H5FVeKtxSFU6gBc2GLQHPuHn8pTVNbhXb9ZCFa7uiCGKrYtIXKmyhnt4SPmjbDudFjjTaJOWbCWPIBAfzhVU8x100DCt0O7DC')

const Product = require('../models/Product')
const Category = require('../models/Category')
const Cart = require('../models/Cart')

router.get('/user/dashboard', ensureAuthenticated, (req, res) => {
    res.render('user/dashboard', {
        name: req.user.name
    })
})

router.get('/', async (req, res) => {
    const goods = await Product.find({}).lean()
    const categories = await Category.find({}).lean()
    const categories_list = await Category.find({}).lean()
    // let goods = new Promise((resolve, reject) => {
    //     dbConnect.query(
    //         "select id,name, cost, image, category from (select id,name,cost,image,category, if(if(@curr_category != category, @curr_category := category, '') != '', @k := 0, @k := @k + 1) as ind   from goods, ( select @curr_category := '' ) v ) goods where ind < 3",
    //         (error, result, field) => {
    //             if (error) return reject(error)
    //             resolve(result)
    //         }
    //     )
    // })
    // let catDescription = new Promise((resolve, reject) => {
    //     dbConnect.query(
    //         "SELECT * FROM category",
    //         (error, result, field) => {
    //             if (error) return reject(error)
    //             resolve(result)
    //         }
    //     )
    // })
    // Promise.all([goods, catDescription])
    //     .then((value) => {
    res.render('store/index', {
        title: 'Music Store Home',
        goods,
        categories,
        categories_list
        // goods: JSON.parse(JSON.stringify(value[0]))
        // cat: JSON.parse(JSON.stringify(value[1]))
    })
    // })
})

router.get('/cat', async (req, res) => {
    const categories = await Category.findOne({ idCat: req.query.id })
    const goods = await Product.find({ category: req.query.id }).lean()
    const categories_list = await Category.find({}).lean()
    res.render('store/categories', {
        title: 'Music Store Categories',
        categories,
        goods,
        categories_list
    })
})

router.get('/product', async (req, res) => {
    const product = await Product.find({ _id: req.query.id }).lean()
    const categories_list = await Category.find({}).lean()
    res.render('store/product', {
        title: 'Music Store Product',
        product,
        categories_list
    })
    console.log(product)
})

router.get('/order', (req, res) => {
    res.render('store/order')
})

router.get('/adding-to-cart/:id', async (req, res, next) => {
    let productId = req.params.id
    let cart = new Cart(req.session.cart ? req.session.cart : {})
    await Product.findById(productId, (err, product) => {
        if (err) {
            return res.redirect('/')
        }
        cart.add(product, product.id)
        req.session.cart = cart
        console.log(req.session.cart)
        res.redirect('/')
    })
})

router.get('/shopping-cart', (req, res, next) => {
    if (!req.session.cart) {
        return res.render('store/shopping-cart', { products: null })
    }
    let cart = new Cart(req.session.cart)
    let products = cart.generateArray()
    let totalPrice = cart.totalPrice
    res.render('store/shopping-cart',
        {
            products,
            totalPrice
        })
    console.log(products)
})

router.get('/checkout', (req, res, next) => {
    if (!req.session.cart) {
        return res.redirect('/shopping-cart')
    }
    let cart = new Cart(req.session.cart)
    res.render('store/order', { total: cart.totalPrice })
})

router.post("/get-goods-info", async (req, res, next) => {
    console.log(req.body.key)
    const goods = await Product.find({ _id: { $in: req.body.key } }).lean()
    // if (req.body.key.length != 0) {
    //     dbConnect.query('SELECT id, name, cost FROM goods WHERE id IN (' + req.body.key.join(',') + ')', function (error, result, fields) {
    //         if (error) throw error;
    //         // console.log(result);
    //         let goods = {};
    //         for (let i = 0; i < result.length; i++) {
    //             goods[result[i]['id']] = result[i];
    //         }
    //         res.json(goods);
    //     });
    // } else {
    //     res.send('0');
    // }
    console.log(goods)
});

router.post("/charge", (req, res) => {
    try {
        stripe.customers
            .create({
                name: req.body.name,
                email: req.body.email,
                source: req.body.stripeToken
            })
            .then(customer =>
                stripe.charges.create({
                    amount: req.body.amount * 100,
                    currency: "usd",
                    customer: customer.id
                })
            )
            .then(() => res.render("store/completed"))
            .catch(err => console.log(err));
    } catch (err) {
        res.send(err);
    }
});

module.exports = router