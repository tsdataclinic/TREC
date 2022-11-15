#!/bin/bash

## Hampton Roads Transit Feed data

wget -O ~/../data/transit_feeds_data/hrt_feeds/google_transit_hrt.zip https://gtfs.gohrt.com/gtfs/google_transit.zip
unzip ~/../data/transit_feeds_data/hrt_feeds/google_transit_hrt.zip -d ~/../data/transit_feeds_data/hrt_feeds/hrt/