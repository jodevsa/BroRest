var os = require('os');
var spawn = require('child_process').spawn;
var broW = require('bro-ids');
var active_capturing = []
const express = require('express')
const app = express();
var tmp = require("tmp");
const EventEmitter = require('events');
const path = require('path');
const fs = require('fs');
var _ = require('lodash/core');
const network = require('network');


let bro_logs = ["x509.log", "tunnel.log", "syslog.log", "ssl.log", "ssh.log", "socks.log", "snmp.log",
    "smtp.log", "smb_mapping.log", "smb_files.log", "smb_cmd.log", "sip.log", "files.log",
    "rfb.log", "rdp.log", "radius.log", "ntlm.log", "mysql.log", "modbus_register_change.log",
    "modbus.log", "kerberos.log", "irc.log", "http.log", "ftp.log",
    "dns.log", "dnp3.log", "dhcp.log", "dce_rpc.log", "conn.log", "packet_filter.log", "weird.log"
];



class broCapture {
    constructor(Interface) {
        this.id = undefined;
        this.filestats = {};
        this.logPath = undefined;
        this.watcher = undefined;
        this.emitter = new EventEmitter();
        this.interface = Interface;
        this.running = false;
        this.bro = undefined;
        this.broErrorLog = []
    }
    stop() {

        if (this.bro && this.running === true)
            this.bro.kill();
        setTimeout(() => {

            this.emitter.emit("end");
        }, 5000);
    }
    watcher() {
        return this.emitter;
    }
    watch() {
        let b = new broW(this.logPath);
        b.watch();
        b.on('*.log', (e, file) => {
            //console.log("filename:",e.file.name);

            //  console.log(e.file.name)
            if (this.filestats[e.file.name] === undefined) {
                this.filestats[e.file.name] = [e.length];
            } else {
                let lastElementLength = this.filestats[e.file.name][this.filestats[e.file.name].length - 1] + 1;
                //+1 is for the new line
                //  console.log("compute");
                //  console.log(e.length,lastElementLength)
                this.filestats[e.file.name].push(e.length + lastElementLength);

            }
            this.emitter.emit(e.file.name);
        })


    }
    start(cb) {
        if (!this.running) {
            tmp.dir((err, path, fd, cleanupCallback) => {
                if (err) {
                    cb(err)
                    return;
                }
                this.id = path.split('-')[1];
                setTimeout(() => {
                    cb(this.id);
                }, 5000);

                this.logPath = path;

                spawn("/usr/bin/touch", bro_logs, {
                    cwd: this.logPath
                });
                this.bro = spawn("/usr/bin/bro", ["-i", this.interface, "-e", "redef LogAscii::use_json=T;"], {
                    cwd: this.logPath
                });
                this.running = true;
                this.bro.stderr.on("data", (data) => {
                    //console.log(data.toString())
                    let err = data.toString();
                    if (err != undefined)
                        this.broErrorLog.push(err);
                    this.emitter.emit("data", data.toString());
                });
                this.bro.stdout.on("data", (data) => {
                    this.emitter.emit("data", data.toString());
                });
                this.bro.on("close", (code) => {
                    this.running = false;
                    this.emitter.emit("close", code);
                });


            });
            return this.emitter;
        }
    }
    // start from line 0 (including  0 ) up to 99 ---> total 100 (exaple)
    // logfile *.log ---> ex : conn.log,dns.log,etc..
    consumeLines(n, logFile, cb) {

        if (bro_logs.indexOf(logFile + ".log") == -1) {
            return cb('{"error":"unkown log!"}')
        }
        /// yes since n start's from 0 dahh
        if (this.filestats[logFile] === undefined || (n + 1) > this.filestats[logFile].length) {
            return cb("{}");
        }
        if (this.filestats[logFile].length === 0) {
            return cb("{}");
        } else {

            ///how many lines to read ---> usually set it to 100
            let readLine = 100;
            //this does not define it self!
            let current_loc = 0;
            //neither do this.
            let loc = 0;

            let fileLocation = path.join(this.logPath, logFile + ".log");
            fs.open(fileLocation, "r", (status, fd) => {
                //4 with new line
                let previous_loc = 0;
                if (n != 0) {
                    previous_loc = this.filestats[logFile][n - 1] + 1;
                }
                if (this.filestats[logFile].length <= n + readLine - 1) {
                    current_loc = this.filestats[logFile][this.filestats[logFile].length - 1];
                    loc = this.filestats[logFile].length - 1;
                } else {
                    current_loc = this.filestats[logFile][(n + readLine - 1)];
                    loc = n + readLine - 1;

                }

                // +2 is for "[" and "]"
                let bufferSize = current_loc - previous_loc + 2;
                let buffer = new Buffer(bufferSize);
                // write from buffer[1], to allow append "[" buffer 0
                let data_buffer_offset = 1;
                fs.read(fd, buffer, data_buffer_offset, current_loc - previous_loc, previous_loc, (err, num) => {
                    // 91 ===''['
                    //93 ===']'
                    buffer[0] = 91
                    buffer[bufferSize - 1] = 93;
                    for (var i = n; i < loc; i++) {
                        buffer[this.filestats[logFile][i] + data_buffer_offset - previous_loc] = 44;

                    }
                    return cb(buffer);
                })
            });
        }
    }
}

function getAvailableInterfaces(cb) {
    network.get_active_interface(function(err, obj) {

        cb(obj)
    })
}
//bro = new broCapture("wlp3s0");
let bro = ""
active_captures = {}
app.get("/bro/utilities/active-interfaces", function(req, res) {
    getAvailableInterfaces(function(data) {
        res.json(data)
    })
});

app.get("/bro/capture/session/:id/status", function(req, res) {
    let id = req.params.id;
    let bro = active_captures[id];
    if (bro === undefined) {
        res.json({
            "error": "session does not exist!"
        })
    }
    res.json({
        "id": bro.id,
        "running": bro.running,
        "stderr": bro.broErrorLog,
        "log_path": bro.logPath
    })

})
app.get("/bro/capture/:interface/start", function(req, res) {
    let interface = req.params.interface;
    let bro = new broCapture(interface);

    bro.start(function(path) {
        bro.watch();
        active_captures[bro.id] = bro;
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
app.get("/bro/capture/session/:id/stop", function(req, res) {
    let id = req.params.id;
    let bro = active_captures[id];
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
app.get("/bro/capture/sessions/active/", function(req, res) {
    let data = [];
    _.forEach(active_captures, (value, key) => {
        data.push({
            "id": value.id,
            "interface": value.interface,
            "running": value.running,
            "log_path": value.logPath
        });


    });
    res.json(data);

});
app.get("/bro/capture/session/:id/consume/:log/:number/", function(req, res) {
    let id = req.params.id;
    let bro = active_captures[id];

    if (bro === undefined) {
        res.json({
            "error": "session does not exist!"
        })
    }
    let i = parseInt(req.params.number);
    let log = req.params.log
    console.log("Number:", i)
    if (i === NaN) {
        res.end("{}");
        return;
    }
    bro.consumeLines(i, log, function(data) {
        res.end(data);
    })

});
app.get("/bro/capture/session/:id/:log/:number/", function(req, res) {

    let id = req.params.id;
    let mini_emitter = new EventEmitter();
    let bro = active_captures[id];
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
        res.end("{}");
        return;
    }
    bro.consumeLines(i, log, function(data) {
        let sent = false;
        if (data == "{}") {
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
              bro.emitter.removeListener("end",endFunc);

                bro.consumeLines(i, log, function(data) {
                    if (!sent)
                        res.end(data);
                    sent = true;

                });

            });
            // this is the most fucked up thing i wrote

            bro.emitter.once("end", endFunc);

        } else {
            res.end(data);
        }
    })
});
app.listen(4444, function() {
    console.log("listenning on PORT:4444")
});
