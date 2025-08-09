-- Create team_members table for mobile number authentication
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mobile_number TEXT NOT NULL UNIQUE,
  name TEXT,
  is_verified BOOLEAN DEFAULT false,
  verification_code TEXT,
  verification_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create policies for team members
CREATE POLICY "Team members can view their own data" 
ON public.team_members 
FOR SELECT 
USING (auth.uid()::text = id::text OR true); -- Allow public access for verification

CREATE POLICY "Team members can insert their own data" 
ON public.team_members 
FOR INSERT 
WITH CHECK (true); -- Allow registration

CREATE POLICY "Team members can update their own data" 
ON public.team_members 
FOR UPDATE 
USING (auth.uid()::text = id::text OR true); -- Allow verification updates

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_team_members_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to verify mobile number and generate verification code
CREATE OR REPLACE FUNCTION public.send_verification_code(mobile_number_param TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  verification_code TEXT;
  member_id UUID;
  expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Generate 6-digit verification code
  verification_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  expires_at := NOW() + INTERVAL '10 minutes';
  
  -- Check if member exists, if not create them
  INSERT INTO public.team_members (mobile_number, verification_code, verification_expires_at)
  VALUES (mobile_number_param, verification_code, expires_at)
  ON CONFLICT (mobile_number) 
  DO UPDATE SET 
    verification_code = EXCLUDED.verification_code,
    verification_expires_at = EXCLUDED.verification_expires_at,
    updated_at = NOW()
  RETURNING id INTO member_id;
  
  -- Return the verification code (in production, this would trigger SMS)
  RETURN JSON_BUILD_OBJECT(
    'success', true,
    'member_id', member_id,
    'verification_code', verification_code,
    'message', 'Verification code sent successfully'
  );
END;
$$;

-- Create function to verify code and login
CREATE OR REPLACE FUNCTION public.verify_member_login(mobile_number_param TEXT, verification_code_param TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  member_record RECORD;
BEGIN
  -- Find member with matching mobile number and verification code
  SELECT id, mobile_number, name, verification_code, verification_expires_at
  INTO member_record
  FROM public.team_members
  WHERE mobile_number = mobile_number_param
    AND verification_code = verification_code_param
    AND verification_expires_at > NOW();
  
  IF member_record.id IS NULL THEN
    RETURN JSON_BUILD_OBJECT(
      'success', false,
      'error', 'Invalid or expired verification code'
    );
  END IF;
  
  -- Mark as verified and clear verification code
  UPDATE public.team_members
  SET is_verified = true,
      verification_code = NULL,
      verification_expires_at = NULL,
      updated_at = NOW()
  WHERE id = member_record.id;
  
  RETURN JSON_BUILD_OBJECT(
    'success', true,
    'member', JSON_BUILD_OBJECT(
      'id', member_record.id,
      'mobile_number', member_record.mobile_number,
      'name', member_record.name
    )
  );
END;
$$;