from enum import Enum
from fastapi import FastAPI, HTTPException, Response, Query
from fastapi.middleware.cors import CORSMiddleware
from psycopg2 import pool
from typing import Union, List
from dotenv import load_dotenv
import os

class Cities(Enum):
  chi = "Chicago"
  hr = "Hampton Roads"
  nola = "New Orleans"
  nyc = "New York City"
  phi = "Philadelphia"
  pitt = "Pittsburgh"
  sf = "San Francisco"

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

@app.get("/route-summary/{msa_id}/{route}")
async def get_route_summary(msa_id: str, route: str):
  col_names = [
    "flood_risk_category_local",
    "heat_risk_category_local",
    "fire_risk_category_national",
    "access_to_hospital_category",
    "job_access_category",
    "worker_vulnerability_category",
  ]

  output = {
    "count": 0,
    "agency": "",
    "route": route,
    "flood_risk_category_local": [0, 0, 0],
    "heat_risk_category_local": [0, 0, 0],
    "fire_risk_category_national": [0, 0, 0],
    "access_to_hospital_category": [0, 0, 0],
    "job_access_category": [0, 0, 0],
    "worker_vulnerability_category": [0, 0, 0],
  }

  connection = app.state.db_pool.getconn()
  cursor = connection.cursor()

  agency_query = f"""
      SELECT
        agencies_serviced
      FROM public.stop_features_new
      WHERE '{route}' = any(public.stop_features_new.routes_serviced)
      AND public.stop_features_new.city = '{msa_id}'
    """
  cursor.execute(agency_query)
  agency = cursor.fetchone()[0]
  if agency:
    output["agency"] = agency

  for col in col_names:
    stops_on_route_query = f"""
      SELECT
        {col}, count({col})
      FROM public.stop_features_new
      WHERE '{route}' = any(routes_serviced)
      AND city = '{msa_id}'
      GROUP BY {col}
    """
    cursor.execute(stops_on_route_query)
    stops_on_route_result = cursor.fetchall()
    summary_values = [0,0,0]
    for s in stops_on_route_result:
      summary_values[s[0]] = s[1]
    output[col] = summary_values

  cursor.close()
  app.state.db_pool.putconn(connection)
  output["count"] = sum(output["flood_risk_category_local"])
  return output

@app.get("/stops-on-route")
async def stops_on_route(cities: Union[List[str], None] = Query(default=None), routes: Union[List[str], None] = Query(default=None)):
  connection = app.state.db_pool.getconn()
  cursor = connection.cursor()

  stops_query = f"""
    SELECT
      stop_id,
      routes_serviced
    FROM public.stop_features_new 
    WHERE
      '{routes[0]}'::text = ANY(routes_serviced)
      AND 
      '{cities[0]}' = city
  """

  for i in range(1, len(cities)):
    stops_query += f"""
      OR ('{routes[i]}'::text = ANY(routes_serviced) AND '{cities[i]}' = city)
    """
  
  cursor.execute(stops_query)
  routes_result = cursor.fetchall()
  stops_result = [row[0] for row in routes_result]


  cursor.close()
  app.state.db_pool.putconn(connection)
  return stops_result

@app.get("/available-routes")
async def get_all_available_routes():
  connection = app.state.db_pool.getconn()
  cursor = connection.cursor()

  routes_query = f"""
    SELECT
      DISTINCT unnest(public.stop_features_new.routes_serviced) AS route,
      public.stop_features_new.route_type,
      public.cities.msa_name,
      public.stop_features_new.city as msa_id
    FROM public.stop_features_new 
    JOIN public.cities ON public.stop_features_new.city = public.cities.msa_id
    ORDER by route asc
  """
  
  cursor.execute(routes_query)
  routes_result = cursor.fetchall()

  avail_routes = {}
  for r in routes_result:
    route = r[0]
    route_type = r[1]
    city = r[2]
    msa_id = r[3]
    if city not in avail_routes:
      avail_routes[city] = {
        'city': city,
        'display_name': city,
        'msa_id': msa_id,
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
      msa_id,
      msa_name,
      ARRAY[ST_X(geometry), ST_Y(geometry)] AS coordinates
    FROM public.cities
    ORDER by msa_name asc
  """

  cursor.execute(city_query)
  cities = [{
    'msa_id': r[0],
    'msa_name': r[1],
    'center': r[2],
  } for r in cursor.fetchall()]
  cursor.close()
  app.state.db_pool.putconn(connection)

  return cities 