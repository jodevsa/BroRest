import urllib.request as request
import urllib.parse
import json
class feedReader:
    def __init__(self,ID,logType,url):
        self.offset=0;
        self.logType=logType;
        self.url=url;
        self.id=ID;

    def _read(self):
        r=request.urlopen(self.url+"/bro/capture/session/"+self.id+"/conn/"+str(self.offset));
        st=r.read().decode("utf-8")
        response=json.loads(st);
        lines=response["data"];
        self.offset+=len(response["data"]);
        for line in lines:
            yield line;

    def read(self):
            while(True):
                for line in self._read():
                    yield line;
class broCapture:
    def __init__(self,host,port):
        self.host=host;
        self.port=port;
        self.url="http://"+host+":"+port
        self.id="-"
        self.iface="-"

    def listen(self,iface):
        self.iface=iface;
        print(self.url+"/bro/capture/"+iface+"/start")
        r=request.urlopen(self.url+"/bro/capture/"+iface+"/start")
        data=json.loads(r.read().decode("utf-8"));
        self.id=data["id"];
        return data;

    def consume(self,logType):
        return feedReader(self.id,logType,self.url);





client=broCapture("127.0.0.1","4444");
print(client.host,client.port)
client.listen("wlp3s0");
print(client.id)
feed=client.consume("conn");
with open("conn.txt","a") as file:
    for line in feed.read():
        file.write(json.dumps(line)+"\n");
        file.flush();
