#!/bin/bash

## Hampton Roads Transit Feed data

wget -O /home/data/transit_feed_data/hrt_feeds/google_transit.zip https://gtfs.gohrt.com/gtfs/google_transit.zip
unzip /home/data/transit_feed_data/hrt_feeds/google_transit.zip -d /home/data/transit_feed_data/hrt_feeds/hrt/

wget -O /home/data/transit_feed_data/hrt_feeds/williamsburg-va-us.zip http://data.trilliumtransit.com/gtfs/williamsburg-va-us/williamsburg-va-us.zip
unzip /home/data/transit_feed_data/hrt_feeds/williamsburg-va-us.zip -d /home/data/transit_feed_data/hrt_feeds/williamsburg/

