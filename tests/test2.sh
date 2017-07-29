#!/bin/bash
count=484;

head -n $count /tmp/tmp-8154GiYqJH0xuIcx/conn.log | sha256sum
head -n $count conn.txt | sha256sum
sed '484q;d' /tmp/tmp-8154GiYqJH0xuIcx/conn.log
sed '484q;d' conn.txt
