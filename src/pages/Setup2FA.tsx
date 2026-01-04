import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Smartphone, Check, Loader2, Copy, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const Setup2FA = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { enroll2FA, confirm2FAEnrollment, is2FAEnabled, profile, user } = useAuth();
  
  const [step, setStep] = useState<'intro' | 'qr' | 'verify'>('intro');
  const [qrData, setQrData] = useState<{ qrCode: string; secret: string } | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (is2FAEnabled) {
      navigate('/');
    }
  }, [is2FAEnabled, navigate]);

  const handleStartEnrollment = async () => {
    setLoading(true);
    const data = await enroll2FA();
    
    if (data) {
      setQrData(data);
      setStep('qr');
    } else {
      toast({
        title: "Error",
        description: "Failed to start 2FA setup. Please try again.",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  const handleCopySecret = async () => {
    if (qrData?.secret) {
      await navigator.clipboard.writeText(qrData.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit code.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    const { error } = await confirm2FAEnrollment(code);
    
    if (error) {
      toast({
        title: "Verification Failed",
        description: "Invalid code. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({
      title: "2FA Enabled",
      description: "Two-factor authentication has been successfully enabled.",
    });
    
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-surface flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 sm:p-8"
      >
        {step === 'intro' && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
              Enable Two-Factor Authentication
            </h2>
            <p className="text-muted-foreground mb-8">
              Your role requires 2FA for enhanced security. This adds an extra layer of protection to your account.
            </p>
            
            <div className="bg-muted/50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2 justify-center">
                <Smartphone className="w-5 h-5" />
                What you'll need
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2 text-left">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  An authenticator app (Google Authenticator, Authy, or similar)
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  Your mobile device to scan the QR code
                </li>
              </ul>
            </div>

            <Button onClick={handleStartEnrollment} variant="gold" size="xl" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                'Continue Setup'
              )}
            </Button>
          </div>
        )}

        {step === 'qr' && qrData && (
          <div className="text-center">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
              Scan QR Code
            </h2>
            <p className="text-muted-foreground mb-6">
              Open your authenticator app and scan this QR code
            </p>
            
            <div className="bg-background rounded-xl p-6 mb-6 inline-block">
              <img 
                src={qrData.qrCode} 
                alt="2FA QR Code" 
                className="w-48 h-48 mx-auto"
              />
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">
                Or enter this code manually:
              </p>
              <div className="flex items-center justify-center gap-2">
                <code className="bg-muted px-4 py-2 rounded-lg font-mono text-sm break-all">
                  {qrData.secret}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopySecret}
                  className="shrink-0"
                >
                  {copied ? <CheckCheck className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <Button onClick={() => setStep('verify')} variant="gold" size="xl" className="w-full">
              I've Scanned the Code
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerify} className="text-center">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
              Verify Setup
            </h2>
            <p className="text-muted-foreground mb-8">
              Enter the 6-digit code from your authenticator app
            </p>

            <div className="space-y-4 mb-8">
              <Label htmlFor="code" className="sr-only">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="h-16 text-center text-3xl font-mono tracking-[0.5em]"
                maxLength={6}
                disabled={loading}
              />
            </div>

            <div className="space-y-3">
              <Button type="submit" variant="gold" size="xl" className="w-full" disabled={loading || code.length !== 6}>
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Enable 2FA'
                )}
              </Button>
              
              <Button type="button" variant="ghost" className="w-full" onClick={() => setStep('qr')} disabled={loading}>
                Back to QR Code
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default Setup2FA;
