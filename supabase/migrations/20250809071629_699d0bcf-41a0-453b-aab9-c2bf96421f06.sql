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