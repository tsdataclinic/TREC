from enum import Enum
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from psycopg2 import pool
from dotenv import load_dotenv
import os

class Cities(Enum):
  pitt = "Pittsburgh"
  nyc = "New York City"
  nola = "New Orleans"
  hr = "Hampton Roads"
  phi = "Philadelphia"
  chi = "Chicago"

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
  app.state.db_pool.closeall()

@app.get("/ping")
async def ping():
  return {"message": "pong"}

@app.get("/available-routes")
async def get_all_available_routes():
  connection = app.state.db_pool.getconn()
  cursor = connection.cursor()

  routes_query = f"""
    SELECT
      DISTINCT unnest(string_to_array(routes_serviced, ',')) AS route,
      route_type,
      city
    FROM public.stop_features ORDER by route asc
  """
  
  cursor.execute(routes_query)
  routes_result = cursor.fetchall()

  avail_routes = {}
  for r in routes_result:
    route = r[0]
    route_type = r[1]
    city = r[2]
    if city not in avail_routes:
      avail_routes[city] = {
        'city': city,
        'display_name': Cities[city].value,
        'route_types': {}
      }
    if route_type not in avail_routes[city]['route_types']:
      avail_routes[city]['route_types'][route_type] = {
        'route_type': route_type,
        'routes_serviced': []
      }
    if route not in avail_routes[city]['route_types'][route_type]['routes_serviced']:
      avail_routes[city]['route_types'][route_type]['routes_serviced'].append(route)


  cursor.close()
  app.state.db_pool.putconn(connection)
  # return avail_routes
  return list(avail_routes.values())

@app.get("/cities")
async def get_all_cities():
  connection = app.state.db_pool.getconn()
  cursor = connection.cursor()

  city_query = f"""
    SELECT
        city,
        ST_AsGeoJSON(
          ST_Expand(
            ST_Extent(wkb_geometry),
            .8
          )
        ),
        ST_AsGeoJSON(ST_Centroid(ST_Extent(wkb_geometry)))
    FROM public.stop_features
    GROUP BY city
  """

  cursor.execute(city_query)
  cities = [{
    'city': r[0],
    'display_name': Cities[r[0]].value,
    'bbox': r[1],
    'center': r[2],
  } for r in cursor.fetchall()]
  cursor.close()
  app.state.db_pool.putconn(connection)

  return cities

@app.get("/hospitals.geojson")
async def hospitals(city: str = ''):
  connection = app.state.db_pool.getconn()
  cursor = connection.cursor()

  query = f"""
    SELECT json_build_object(
      'type', 'FeatureCollection',
      'features', json_agg(ST_AsGeoJSON(row.*)::json)
    ) FROM (SELECT * FROM public.hospitals {"where city = %s" if city else ""})
    as row
    """
  city = Cities(city).name
  if not city:
      raise HTTPException(status_code=404, detail="City not found")

  cursor.execute(query, (city,))
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
  city = Cities(city).name
  if not city:
      raise HTTPException(status_code=404, detail="City not found")

  cursor.execute(query, (city,))
  result = cursor.fetchone()[0]

  cursor.close()
  app.state.db_pool.putconn(connection)
  return result