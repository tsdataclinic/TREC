from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from dotenv import load_dotenv
import os

load_dotenv('../.env')

POSTGRES_HOST = os.getenv('POSTGRES_HOST')
POSTGRES_PORT = os.getenv('POSTGRES_PORT')
POSTGRES_USER = os.getenv('POSTGRES_USER')
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD')
POSTGRES_DB = os.getenv('POSTGRES_DB')

app = FastAPI()

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"], # since we have just the GET requests
  allow_credentials=True,
  allow_methods=["*"],
	allow_headers=["*"],
  max_age=3600,
)

def get_db_connection():
  return psycopg2.connect(user=POSTGRES_USER,
                  password=POSTGRES_PASSWORD,
                  host=POSTGRES_HOST,
                  port=POSTGRES_PORT,
                  database=POSTGRES_DB)

@app.get("/ping")
async def ping():
  return {"message": "pong"}

@app.get("/hospitals.geojson")
async def hospitals():
  connection = get_db_connection()
  cursor = connection.cursor()

  query = """
    SELECT jsonb_build_object(
      'type', 'FeatureCollection',
      'features', jsonb_agg(feature)
    ) FROM (
      SELECT jsonb_build_object(
        'type', 'Feature',
        'geometry', ST_AsGeoJSON(wkb_geometry)::jsonb,
        'properties', to_jsonb(row) - 'wkb_geometry'
      ) AS feature
      FROM (SELECT * from public.hospitals) row) features
    """

  cursor.execute(query)
  result = cursor.fetchone()[0]
  cursor.close()
  connection.close()

  return result

@app.get("/stop_features.geojson")
async def stop_features(city: str | None = None):
  connection = get_db_connection()
  cursor = connection.cursor()

  query = f"""
    SELECT jsonb_build_object(
      'type', 'FeatureCollection',
      'features', jsonb_agg(feature)
    ) FROM (
      SELECT jsonb_build_object(
        'type', 'Feature',
        'geometry', ST_AsGeoJSON(wkb_geometry)::jsonb,
        'properties', to_jsonb(row) - 'wkb_geometry'
      ) AS feature
      FROM (SELECT * from public.stop_features {"where city = %s" if city else ""}) row) features
    """

  """
  Different city name formats are being used in frontend and the database
  Following is an adhoc conversation between the two
  """
  if city:
    if city == "New York City":
      city = "nyc"
    elif city == "Hampton Roads":
      city = "hr"
    else:
      raise HTTPException(status_code=404, detail="City not found")

    cursor.execute(query, (city,))
  else:
    cursor.execute(query)
  
  result = cursor.fetchone()[0]

  # convert comma separated string to array
  for feature in result['features']:
    properties = feature['properties']
    properties['routes_serviced'] = properties['routes_serviced'].split(",")
  
  cursor.close()
  connection.close()

  return result