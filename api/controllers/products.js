const mongoose = require('mongoose');

const Product = require('../models/product');

exports.products_get_all = (req, res, next) => {
    Product.find()
        .select('name _id price productImage') //hangi alanları almak istediğimi belirliyorum
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        _id: doc._id,
                        name: doc.name,
                        price: doc.price,
                        productImage: doc.productImage,
                        request: {
                            type: 'GET',
                            description: 'PRODUCT_GET_BY_ID',
                            url: 'http://localhost:3000/products/' + doc._id
                        }

                    }
                })
            };
            //verinin null gelmesi bir sorun yaratıyorsa yorum satırını kaldır!
            //if (docs.length > 0) {
            res.status(200).json(response);
            //} else {
            //    res.status(404).json({
            //        message: 'No entries found'
            //    });
            //}
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.products_create_product = (req, res, next) => {

    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });

    product
        .save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Created product successfully',
                createdProduct: {
                    _id: result._id,
                    name: result.name,
                    price: result.price,
                    productImage: result.productImage,
                    request: {
                        type: 'GET',
                        description: 'PRODUCT_GET_BY_ID',
                        url: 'http://localhost:3000/products/' + result._id
                    }
                }
            });
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.products_get_product = (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .select('_id name price productImage')
        .exec()
        .then(doc => {
            console.log("From database", doc);
            if (doc) {
                res.status(200).json({
                    message: 'Product information listed',
                    product: {
                        _id: doc._id,
                        name: doc.name,
                        price: doc.price,
                        productImage: doc.productImage,
                        request: {
                            type: 'GET',
                            description: 'GET_ALL_PRODUCTS', //link hakkında bilgi verdik
                            url: 'http://localhost:3000/products/'
                        }
                    }

                });
            } else {
                res.status(404).json({ message: 'No valid entry found for provided ID' });
            }

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
}

exports.products_update_product = (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.updateOne({ _id: id }, { $set: updateOps })
        .select('_id name price productImage')
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Product updated',
                reuqest: {
                    type: 'GET',
                    description: 'PRODUCT_GET_BY_ID',
                    url: 'http://localhost:3000/products/' + id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
}

exports.products_delete_product = (req, res, next) => {
    const id = req.params.productId;
    Product.remove({ _id: id })
        .select('_id name price productImage')
        .exec()
        .then(result => {
            res.status(200).json({

                message: 'Product deleted',
                request: {
                    type: 'POST',
                    description: 'ADD_PRODUCT',
                    url: 'http://localhost:3000/products/',
                    body: { name: 'String', price: 'Number' }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
}