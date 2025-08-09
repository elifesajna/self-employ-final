import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMemberAuth } from '@/contexts/MemberAuthContext';
import TranslatedText from '@/components/TranslatedText';

const MemberAuth = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerificationStep, setIsVerificationStep] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [sentVerificationCode, setSentVerificationCode] = useState('');

  const { sendVerificationCode, verifyAndLogin } = useMemberAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSendCode = async () => {
    if (!mobileNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter your mobile number",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    const result = await sendVerificationCode(mobileNumber);
    
    if (result.success) {
      setIsVerificationStep(true);
      setSentVerificationCode(result.verificationCode || '');
      toast({
        title: "Code Sent",
        description: `Verification code: ${result.verificationCode}`,
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to send verification code",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter the verification code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    const result = await verifyAndLogin(mobileNumber, verificationCode);
    
    if (result.success) {
      toast({
        title: "Success",
        description: "Login successful!",
      });
      navigate('/');
    } else {
      toast({
        title: "Error",
        description: result.error || "Invalid verification code",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setMobileNumber('');
    setVerificationCode('');
    setIsVerificationStep(false);
    setSentVerificationCode('');
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-md mx-auto pt-8">
        {/* Back to Home */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <TranslatedText id="common.backToHome" />
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              <TranslatedText id="auth.memberTitle" />
            </CardTitle>
            <CardDescription>
              <TranslatedText id="auth.memberSubtitle" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">
                  <TranslatedText id="auth.login" />
                </TabsTrigger>
                <TabsTrigger value="register">
                  <TranslatedText id="auth.register" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                {!isVerificationStep ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="mobile">
                        <TranslatedText id="auth.mobileNumber" />
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="mobile"
                          type="tel"
                          placeholder="Enter your registered mobile number"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={handleSendCode}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? "Sending..." : <TranslatedText id="auth.login" />}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="code">
                        <TranslatedText id="auth.verificationCode" />
                      </Label>
                      <Input
                        id="code"
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        maxLength={6}
                      />
                      {sentVerificationCode && (
                        <p className="text-sm text-muted-foreground">
                          Demo code: {sentVerificationCode}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Button 
                        onClick={handleVerifyCode}
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? "Verifying..." : <TranslatedText id="auth.verify" />}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={resetForm}
                        className="w-full"
                      >
                        <TranslatedText id="common.back" />
                      </Button>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <div className="text-center py-4">
                  <p className="text-muted-foreground">
                    <TranslatedText id="auth.registerDescription" />
                  </p>
                </div>
                {!isVerificationStep ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="mobile-register">
                        <TranslatedText id="auth.mobileNumber" />
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="mobile-register"
                          type="tel"
                          placeholder="Enter mobile number"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={handleSendCode}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? "Finding..." : <TranslatedText id="auth.find" />}
                    </Button>
                    <Button 
                      onClick={handleSendCode}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full"
                    >
                      <TranslatedText id="auth.register" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="code-register">
                        <TranslatedText id="auth.verificationCode" />
                      </Label>
                      <Input
                        id="code-register"
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        maxLength={6}
                      />
                      {sentVerificationCode && (
                        <p className="text-sm text-muted-foreground">
                          Demo code: {sentVerificationCode}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Button 
                        onClick={handleVerifyCode}
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? "Verifying..." : <TranslatedText id="auth.register" />}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={resetForm}
                        className="w-full"
                      >
                        <TranslatedText id="common.back" />
                      </Button>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MemberAuth;