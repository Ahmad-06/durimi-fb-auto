const express = require('express');

const reOrder = express.Router();
module.exports = reOrder;

const { loggedIn } = require('../../../../utils/loggedIn');
const changePass = require('../../../../utils/changePass');

reOrder.get('/:type', loggedIn, changePass, (req, res) => {
    const type = req.params.type;

    if (!['automated', 'scheduled'].includes(type)) return res.redirect('/404');

    res.render(`posts/re-order/re-order`, { type });
});
