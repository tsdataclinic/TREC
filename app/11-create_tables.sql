
CREATE TABLE public.hospitals (
    "FEATURE_NAME" text,
    "FEATURE_CLASS" text,
    geometry public.geometry(Point,4326)
);

CREATE TABLE public.stop_features (
    access_to_hospital_category bigint,
    city text,
    flood_risk_category bigint,
    flood_risk_pct double precision,
    id text,
    job_access_category bigint,
    jobs_access_count double precision,
    route_type text,
    stop_id text,
    stop_name text,
    worker_vulnerability_category bigint,
    worker_vulnerability_score double precision,
    geometry public.geometry(Point,4326)
);
