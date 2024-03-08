import geopandas as gpd
from sqlalchemy import create_engine, text
from sqlalchemy.types import ARRAY, VARCHAR
from geoalchemy2 import Geometry, WKTElement

def drop_table(conn_str, table_name):
    
    engine = connection(conn_str)
    with engine.connect() as conn:
        conn.execute(text(f"DROP TABLE {table_name} ;"))
        conn.commit()

    # # Commit if necessary
    # conn.commit()

def get_dtypes(table_name):
    if table_name == 'stop_features':
        return {'geometry': Geometry('POINT', srid=4326),'routes_serviced':ARRAY(VARCHAR)}
    else:
        return {'geometry': Geometry('POINT', srid=4326)}        

def connection(conn_str):
    return create_engine(conn_str,echo=False)

def write_table_to_db(conn_str, df, table_name):
    conn = connection(conn_str)
    df['geometry'] = df['geometry'].apply(lambda geom: WKTElement(geom.wkt, srid = 4326))
    dtype_json = get_dtypes(table_name)
    df.to_sql(name=table_name,con=conn,index=False,if_exists='append', chunksize = 100000, dtype=dtype_json)