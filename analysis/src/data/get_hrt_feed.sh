#!/bin/bash

## Hampton Roads Transit Feed data

wget -O /home/data/transit_feeds_data/hrt_feeds/google_transit_hrt.zip https://gtfs.gohrt.com/gtfs/google_transit.zip
unzip /home/data/transit_feeds_data/hrt_feeds/google_transit_hrt.zip -d /home/data/transit_feeds_data/hrt_feeds/hrt/