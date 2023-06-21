from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from psycopg2 import pool
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

@app.on_event("startup")
async def startup():
  app.state.db_pool = pool.SimpleConnectionPool(1, 20, user=POSTGRES_USER,
                  password=POSTGRES_PASSWORD,
                  host=POSTGRES_HOST,
                  port=POSTGRES_PORT,
                  database=POSTGRES_DB)

@app.on_event("shutdown")
async def shutdown():
  app.state.db_pool.SimpleConnectionPool.closeall()

@app.get("/ping")
async def ping():
  return {"message": "pong"}

@app.get("/routes")
async def get_all_routes(city: str = ''):

  return {}

@app.get("/hospitals.geojson")
async def hospitals():
  connection = app.state.db_pool.getconn()
  cursor = connection.cursor()

  query = """
    SELECT json_build_object(
      'type', 'FeatureCollection',
      'features', json_agg(ST_AsGeoJSON(row.*)::json)
    ) FROM (SELECT * FROM public.hospitals) as row
    """

  cursor.execute(query)
  result = cursor.fetchone()[0]
  cursor.close()
  app.state.db_pool.putconn(connection)
  

  return result

@app.get("/stop_features.geojson")
async def stop_features(city: str = ''):
  connection = app.state.db_pool.getconn()
  cursor = connection.cursor()

  query = f"""
    SELECT json_build_object(
      'type', 'FeatureCollection',
      'features', json_agg(ST_AsGeoJSON(row.*)::json)
    ) FROM (
        SELECT 
          access_to_hospital_category,
          city,
          flood_risk_category,
          id,
          job_access_category,
          string_to_array(routes_serviced, ',') as routes_serviced,
          route_type,
          stop_id,
          stop_name,
          worker_vulnerability_category,
          wkb_geometry
        FROM public.stop_features {"where city = %s" if city else ""}
      ) as row
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

  cursor.close()
  app.state.db_pool.putconn(connection)
  return result