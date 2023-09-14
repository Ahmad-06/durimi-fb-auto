const express = require('express');

const reOrder = express.Router();
module.exports = reOrder;

const { loggedIn } = require('../../../../utils/loggedIn');

reOrder.get('/:type', loggedIn, (req, res) => {
    const type = req.params.type;

    if (!['automated', 'scheduled'].includes(type)) return res.redirect('/404');

    res.render(`posts/re-order/re-order`, { type });
});
