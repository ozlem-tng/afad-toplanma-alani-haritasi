-- Active: 1784534335881@@127.0.0.1@5432@afad_toplanma_alani_haritasi@public
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE INDEX IF NOT EXISTS places_geom_idx ON places USING GIST (geom);

CREATE TABLE places (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    geom GEOMETRY(Point, 4326) NOT NULL
);

CREATE INDEX places_geom_idx ON places USING GIST (geom);