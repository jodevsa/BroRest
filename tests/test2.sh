#!/bin/bash
count=1;

head -n $count /tmp/tmp-15916zeBAVNB85RE6/conn.log | sha256sum
head -n $count ../clients/conn.txt | sha256sum
sed '1q;d' /tmp/tmp-15916zeBAVNB85RE6/conn.log
sed '1q;d' ../clients/conn.txt
