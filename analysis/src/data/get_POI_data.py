from urllib.request import urlopen
import shutil
import os
from zipfile import ZipFile
from io import BytesIO

BASE_PATH = 'data'

path = f"{BASE_PATH}/national/points_of_interest/"
url = "https://geonames.usgs.gov/docs/stategaz/NationalFile.zip"

if not os.path.isdir(path):
        os.makedirs(path)

with urlopen(url) as zipresp:
    with ZipFile(BytesIO(zipresp.read())) as zfile:
        zfile.extractall(path)

