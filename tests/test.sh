#!/bin/bash
echo "w"
i=1

while [ $i ]
do
  sha256sum /tmp/tmp-18205FeOqaHOV3gOa/conn.log
  wc -l /tmp/tmp-18205FeOqaHOV3gOa/conn.log
  sha256sum conn1.txt
  wc -l conn1.txt
  sleep 2;
  clear
done
