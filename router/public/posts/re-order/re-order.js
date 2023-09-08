const express = require('express');

const reOrder = express.Router();
module.exports = reOrder;

reOrder.get('/:type', (req, res) => {
    const type = req.params.type;

    if (!['automated', 'scheduled'].includes(type)) return res.redirect('/404');

    res.render(`posts/re-order/${type}`);
});
