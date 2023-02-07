import urllib.request

mta_urls = ["http://web.mta.info/developers/data/nyct/subway/google_transit.zip",
           "http://web.mta.info/developers/data/nyct/bus/google_transit_bronx.zip",
           "http://web.mta.info/developers/data/nyct/bus/google_transit_brooklyn.zip",
           "http://web.mta.info/developers/data/nyct/bus/google_transit_queens.zip",
           "http://web.mta.info/developers/data/nyct/bus/google_transit_staten_island.zip",
           "http://web.mta.info/developers/data/nyct/bus/google_transit_manhattan.zip",
            "http://web.mta.info/developers/data/busco/google_transit.zip"]

mta_names = ["mta_subway.zip"] + [x[45:len(x)] for x in mta_urls[1:6]] + ["bus_company.zip"]
base_path = "/home/data/transit_feed_data/mta_feeds/"

for i in range(0,7):
    urllib.request.urlretrieve(mta_urls[i], base_path + mta_names[i])
    print("Downloading from: " + mta_urls[i] + " as " + mta_names[i])