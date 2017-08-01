const express = require('express')
var router = express.Router();
var session=require("./session")
var capture=require("./capture")
const spawn = require('child_process').spawn;
router.use('/session', session);
router.use('/capture', capture);

function getUpTime(){
  seconds=process.uptime();
  var date = new Date(null);
  date.setSeconds(seconds);
  return date.toISOString().substr(11, 8);
}
function version(cb){
  spawn("/usr/bin/bro", ["-v"], {
      cwd: this.logPath
  }).stderr.on("data",(data)=>{
    cb(data.toString().split(" ")[2].trim());

  });


}

router.get("/",function(req,res){
  version(function(ver){
    res.json({"Description":"Bro IDS RESTFUL API","BRO Version":ver,"Version":"0.0.1","Uptime":getUpTime()});

  });
});


module.exports = router;
