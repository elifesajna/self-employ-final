-- Add role system to admins table
ALTER TABLE public.admins ADD COLUMN role TEXT NOT NULL DEFAULT 'admin';

-- Create enum for admin roles
CREATE TYPE public.admin_role AS ENUM ('admin', 'super_admin');

-- Update the role column to use the enum
ALTER TABLE public.admins ALTER COLUMN role TYPE admin_role USING role::admin_role;

-- Update the verify_password function to return admin data including role
CREATE OR REPLACE FUNCTION public.verify_admin_login(username text, password text)
 RETURNS TABLE(id uuid, username text, role admin_role)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  stored_hash TEXT;
  admin_record RECORD;
BEGIN
  SELECT a.id, a.username, a.password_hash, a.role INTO admin_record
  FROM public.admins a 
  WHERE a.username = $1;
  
  IF admin_record.password_hash IS NULL THEN
    RETURN;
  END IF;
  
  IF admin_record.password_hash = crypt(password, admin_record.password_hash) THEN
    RETURN QUERY SELECT admin_record.id, admin_record.username, admin_record.role;
  END IF;
END;
$function$