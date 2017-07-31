const express = require('express')
var router = express.Router();
var session=require("./session")
var capture=require("./capture")

router.use('/session', session);
router.use('/capture', capture);
module.exports = router;
