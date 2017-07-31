const express = require('express');
var router = express.Router();
const active_sessions = require('../lib/activesessions');
const broCapture = require('../lib/brocapture');
/**
 * @api {get} /bro/capture/:interface/:start Start Capturing network interface traffic
 * @apiName CaptureInterface
 * @apiGroup Capture
 *
 * @apiParam {String} Network Interface
 *
 * @apiSuccess {String} id Capture session ID
 * @apiSuccess {Boolean} running  status of session
 * @apiSuccess {String} stderr  capturing session stderr
 */

router.get("/:interface/start", function(req, res) {
    let interface = req.params.interface;
    let bro = new broCapture(interface);

    bro.start(function(path) {
        bro.watch();
        active_sessions[bro.id] = bro;
        if (bro.running === true) {
            res.json({
                "id": bro.id,
                "running": bro.running,
                "stderr": bro.broErrorLog
            })
        } else {
            res.json({
                "error": "unkown error occured!"
            })
        }

    });

});




module.exports = router;
