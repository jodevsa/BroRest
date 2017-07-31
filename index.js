const express = require('express')
const app = express();
const network = require('network');
const api = require('./routes/api');
app.use('/bro', api);


function getAvailableInterfaces(cb) {
    network.get_active_interface(function(err, obj) {

        cb(obj)
    })
}
app.get("/bro/utilities/active-interfaces", function(req, res) {
    getAvailableInterfaces(function(data) {
        res.json(data)
    })
});






app.listen(4444, function() {
    console.log("listenning on PORT:4444")
});
