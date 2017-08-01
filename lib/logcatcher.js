const fs = require('fs');
const EventEmitter = require('events');
const path = require('path');
var Tail = require('tail-forever')
function watchDir(dir, ext) {
    let emiter = new EventEmitter();
    fs.watch(dir, (eventType, filename) => {
        let fileExt = path.extname(filename.toString())
        let filePath = path.join(dir, filename)

        if (fileExt === ext && eventType === "change" || eventType === "rename") {
            fs.lstat(filePath, (err, stats) => {
                if (!err && stats.isFile()) {
                    emiter.emit("file", filename);
                };

            })
        }
    });

    return emiter;

}

function lsFiles(dir, ext) {
    return new Promise((resolve, reject) => {

        fs.readdir(dir, (err, files) => {
            if (err)
                reject(err)
            let logFiles = [];
            for (i in files) {
                if (path.extname(files[i]) === ext)
                    logFiles.push(files[i]);

            }
            resolve(logFiles)


        });
    });
}
class LogCatcher {
    watch(filename) {
        let fileExt = path.extname(filename.toString())
        let filePath = path.join(this.Location, filename)

        if (this.files.indexOf(filename) == -1) {
            this.files.push(filename);

            let tail = new Tail(filePath, {
                start: 0
            })
            tail.on("line", (data) => {
                try {
                    let broEvent = JSON.parse(data);
                    let broEventLength = data.length;
                    let name = filename.substring(0, filename.length - fileExt.length);
                    this.emitter.emit("*.log", {
                        "event": broEvent,
                        "length": broEventLength,
                        "file": {
                            "full": filename,
                            "name": name,
                            "extinsion": fileExt
                        }
                    })
                } catch (ex) {
                    console.log('error parsing log - not in json format? - ', ex)
                }
            });



        }
    }
    isWatched(filename) {
        if (this.files.indexOf(filename) == -1) {
            return false;

        } else {
            return true;
        }

    }
    constructor(location) {
        this.tails = [];
        this.files = [];
        this.Location = location;
        this.emitter = new EventEmitter();
        watchDir(location, ".log").on("file", (filename) => {
            this.watch(filename);

        });
        lsFiles(this.Location, ".log").then((files) => {
            for (i in files) {
                if (!this.isWatched(files[i])) {
                    this.watch(files[i]);
                }

            }

        })


    }




}

module.exports = LogCatcher;
//logs= new LogCatcher("./logs");
