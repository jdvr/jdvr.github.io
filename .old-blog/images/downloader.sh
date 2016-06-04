#!/bin/bash
while IFS='' read -r line || [[ -n "$line" ]]; do
	spliline=($line)
	if [ -d ${spliline[0]} ]; then 
  		cd ${spliline[0]}
  	else
  		mkdir -p ${spliline[0]}
    	cd ${spliline[0]}
  	fi
    wget "http://juandavidvega.es/blog/wp-content/uploads/"${spliline[0]}${spliline[1]}
    cd /home/jdvr/projects/juandavidvegaesblog/.old-blog/images
    
done < urls