BEGIN;

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS role character varying(20) DEFAULT 'user'::character varying NOT NULL;

DO $$
BEGIN
    IF (
        SELECT count(*)
        FROM public.users
        WHERE lower(email) = lower('aanchal08062006@gmail.com')
    ) <> 1 THEN
        RAISE EXCEPTION 'Expected exactly one designated admin account; role migration was not applied.';
    END IF;
END;
$$;

UPDATE public.users
SET role = 'user'
WHERE role IS NULL;

ALTER TABLE public.users
    ALTER COLUMN role SET DEFAULT 'user'::character varying,
    ALTER COLUMN role SET NOT NULL;

UPDATE public.users
SET role = 'admin'
WHERE lower(email) = lower('aanchal08062006@gmail.com');

COMMIT;
