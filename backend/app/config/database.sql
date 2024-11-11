DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'Dev') THEN
        CREATE DATABASE "Dev";
    END IF;
END $$;