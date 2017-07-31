const express = require('express')
const active_sessions = require('../lib/activesessions');
var router = express.Router();
var _ = require('lodash/core');
const EventEmitter = require('events');
/**
 * @api {get} /bro/session/:id/:status
 Check session status
 * @apiName CheckStatus
 * @apiGroup Session
 *
 * @apiParam {String} Session ID
 *
 * @apiSuccess {String} id Capture session ID
 * @apiSuccess {Boolean} running  status of session
 * @apiSuccess {String} stderr  capturing session stderr
 * @apiSuccess {String} logPath  actual session log's directory
 * @apiError {String} sessionNotFound session does not exists
 */
router.get("/:id/status", function(req, res) {
    let id = req.params.id;
    let bro = active_sessions[id];
    if (bro === undefined) {
        res.json({
            "error": "session does not exist!"
        })
    }
    res.json({
        "id": bro.id,
        "running": bro.running,
        "stderr": bro.broErrorLog,
        "logPath": bro.logPath
    })

})

/**
 * @api {get} /bro/session/:id/:stop
 Stop's a running session
 * @apiName stopSession
 * @apiGroup Session
 *
 * @apiParam {String} Session ID
 *
 * @apiSuccess {String} notice Results of session stop.
 * @apiError {String} sessionNotFound session does not exists
 */
router.get("/:id/stop", function(req, res) {
    let id = req.params.id;
    let bro = active_sessions[id];
    if (bro === undefined) {
        res.json({
            "error": "session does not exist!"
        })
    }
    bro.stop();
    res.json({
        "notice": "session id:" + id + " successfully stopped!"
    });

});
/**
 * @api {get} /bro/session/active Lists all active sessions
 * @apiName activeSessions
 * @apiGroup Session
 *
 * @apiParam {String} Session ID
 *
 * @apiSuccess {Object[]} sessions a list containing all sessions information.
 * @apiSuccess {Number} Count count of retrived active sessions
 */
router.get("/active", function(req, res) {
    let data = [];
    _.forEach(active_sessions, (value, key) => {
        data.push({
            "id": value.id,
            "interface": value.interface,
            "running": value.running,
            "log_path": value.logPath
        });


    });
    res.json({
        "sessions": data,
        "count": data.length
    })

});


/**
 * @api {get} /bro/session/:id/:log/:offset/
 Consume specified log depending on offset
 * @apiName ConsumeLogs
 * @apiGroup Session
 *
 * @apiParam {String} Session ID
 * @apiParam {String} log logType
 * @apiParam {Number} offset logOfset
 *
 * @apiSuccess {Object[]} data consumed logs
 * @apiError {String} sessionNotFound session does not exists
 */
router.get("/:id/:log/:number/", function(req, res) {

    let id = req.params.id;
    let mini_emitter = new EventEmitter();
    let bro = active_sessions[id];
    if (bro === undefined) {
        res.json({
            "error": "session does not exist!"
        })
    }
    let log = req.params.log;
    bro.emitter.once(log, () => {
        mini_emitter.emit("data");
        console.log("emitted from bro.emitetr");
        //bro.emitter.removeListener(log,function(){});



    });
    if (bro === undefined) {
        res.json({
            "error": "session does not exist!"
        })
    }
    let i = parseInt(req.params.number);

    console.log("Number:", i)
    if (i === NaN) {
        res.end({
            "data": []
        });
        return;
    }
    bro.consumeLines(i, log, function(data) {
        let sent = false;
        if (data.data.length === 0) {
            //to solve memory leak in bro.emitter event emitter/
            /// must re-code this agian -.-
            let endFunc = (code) => {
                if (!sent)
                    res.json({
                        "id": bro.id,
                        "code": code,
                        "end": true
                    });
                sent = true;

            }
            mini_emitter.once("data", () => {
                //end memory leak with same pointer of function
                bro.emitter.removeListener("end", endFunc);

                bro.consumeLines(i, log, function(data) {
                    if (!sent)

                        res.end(JSON.stringify(data));
                    sent = true;

                });

            });
            // this is the most fucked up thing i wrote

            bro.emitter.once("end", endFunc);

        } else {
            res.json(data);
        }
    })
});





module.exports = router;
