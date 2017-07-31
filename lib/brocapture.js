const EventEmitter = require('events');
const tmp = require('tmp');
const spawn = require('child_process').spawn;
const bro_logs=require("./brologs");
const path = require('path');
const fs = require('fs');
const logcatcher = require('./logcatcher');
class BroCapture {
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
        let b = new logcatcher(this.logPath);
        b.emitter.on('*.log', (e, file) => {
            if (this.filestats[e.file.name] === undefined) {
                this.filestats[e.file.name] = [e.length];
            } else {
                let lastElementLength = this.filestats[e.file.name][this.filestats[e.file.name].length - 1] + 1;
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
                this.bro = spawn("/usr/bin/bro", ["-i", this.interface, "-e", "redef LogAscii::use_json=T;"], {
                    cwd: this.logPath
                });
                this.running = true;
                this.bro.stderr.on("data", (data) => {
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
            return cb({"data":[]});
        }
        if (this.filestats[logFile].length === 0) {
            return cb({"data":[]});
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

                    return cb({"data":JSON.parse(buffer)});
                })
            });
        }
    }
}


module.exports = BroCapture;
