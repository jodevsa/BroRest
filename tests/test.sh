#!/bin/bash
echo "w"
i=1

while [ $i ]
do
  sha256sum /tmp/tmp-66254Lc93NWgbhDr/conn.log
  wc -l /tmp/tmp-66254Lc93NWgbhDr/conn.log
  sha256sum ../clients/node/conn1.txt
  wc -l ../clients/node/conn1.txt
  sleep 2;
  clear
done
