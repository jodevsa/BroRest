connection = {
    "url": "http://127.0.0.1",
    "port": "4444"
}
var fs = require('fs');
const request = require('request');
const EventEmitter = require('events');
class broRestClient {
    constructor(url, port) {
        this.url = "http://" + url;
        this.id = 0;
        this.port = port;
    }

    listen(iface, cb) {
        request({
            url: this.url + ":" + this.port + "/bro/capture/" + iface + "/start",
            method: "GET"
        }, (err, res) => {
            let data = JSON.parse(res.body);

            this.id = data.id;
            console.log(this.id, "id")
            cb(this.id)


        })

    }
    _feed(logType, offset, id, cb) {
        console.log(this.id, "id1")
        console.log(this.url + ":" + this.port + "/bro/capture/session/" + id + "/" + logType + "/" + offset)
        request({
            url: this.url + ":" + this.port + "/bro/capture/session/" + id + "/" + logType + "/" + offset,
            method: "GET"
        }, function(err, res) {
            let data = JSON.parse(res.body);

            this.id = data.id;
            console.log(this.id);

            cb({
                "lines": data,
                "size": data.length
            });
        })

    }

    consume(logType) {
        console.log(this.id, "id2")
        let main_emitter = new EventEmitter();
        let asynclooper = new EventEmitter();
        let offset = 0;
        asynclooper.on("loop", () => {
            this._feed(logType, offset, this.id, (data) => {
                let lines = data.lines;
                if(lines instanceof Array){
                //  console.log("data",data)
                offset += data.size;

                for (var i = 0; i < data.size; i++) {
                    main_emitter.emit("line", lines[i]);
                }
                asynclooper.emit("loop");

              }
              else{
                ///control messages//
                main_emitter.emit("EOF");

              }

            });
        });
        asynclooper.emit("loop");

        return main_emitter;

    }





}





config = {
    "ip": "127.0.0.1",
    "port": "4444"
}
client = new broRestClient(config.ip, config.port);
client.listen("wlp3s0", (id) => {
    console.log("capture session id", id);
    let feed = client.consume("conn");

    feed.on("line", function(line) {
        fs.appendFileSync('conn1.txt', JSON.stringify(line) + "\n");

    }).on("EOF",function(){
      console.log("capture ended log")
    })

});
