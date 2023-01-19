import areal_interpolation as areal
import geopandas as geopd
import pandas as pd

census_data = pd.read_csv("/home/data/census/nyc/acs/acs_wide.csv")
census_geo = geopd.read_file("/home/data/census/nyc/geo/nyc_tracts.geojson")
nta = geopd.read_file("https://data.cityofnewyork.us/api/geospatial/d3qk-pfyz?method=export&format=GeoJSON")

nta_interpolated = areal.main(census_geo, census_data, nta, "ntacode")
nta_out = nta.merge(nta_interpolated.reset_index())

home_path = "/home/data/census/nyc/processed/"
nta_out.to_file(home_path + "NTA_interpolated.geojson", driver='GeoJSON')