#!/bin/bash
echo "w"
i=1

while [ $i ]
do
  sha256sum /tmp/tmp-15916zeBAVNB85RE6/conn.log
  wc -l /tmp/tmp-15916zeBAVNB85RE6/conn.log
  sha256sum ../clients/conn.txt
  wc -l ../clients/conn.txt
  sleep 2;
  clear
done
