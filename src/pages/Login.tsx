import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
  Info,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import { useAdminLogin } from "@/queries/auth.mutations";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  mobileNumber: z.string().optional(),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signIn, signUp, user, loading: authLoading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const loginMutation = useAdminLogin();

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    mobileNumber: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      const from =
        (location.state as { from?: { pathname: string } })?.from?.pathname ||
        "/";
      navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, location]);

  const validateForm = () => {
    try {
      loginSchema.parse(credentials);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0])
            fieldErrors[error.path[0] as string] = error.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const validateSignupForm = () => {
    try {
      signupSchema.parse(signupData);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0])
            fieldErrors[error.path[0] as string] = error.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  // const handleLogin = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   if (!validateForm()) return;

  //   setLoading(true);

  //   try {
  //     const { error, requires2FA: needs2FA } = await signIn(credentials.email, credentials.password);

  //     if (error) {
  //       let errorMessage = "Invalid credentials. Please try again.";

  //       if (error.message.includes("Invalid login credentials")) {
  //         errorMessage = "Invalid email or password.";
  //       } else if (error.message.includes("Email not confirmed")) {
  //         errorMessage = "Please confirm your email before logging in.";
  //       }

  //       toast({
  //         title: "Login Failed",
  //         description: errorMessage,
  //         variant: "destructive",
  //       });
  //       return;
  //     }

  //     if (needs2FA) {
  //       setRequires2FA(true);
  //       return;
  //     }

  //     toast({
  //       title: "Welcome Back",
  //       description: "Successfully logged in to CryptoExec Platform.",
  //     });

  //     const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
  //     navigate(from, { replace: true });
  //   } catch (err) {
  //     toast({
  //       title: "Error",
  //       description: "An unexpected error occurred. Please try again.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    loginMutation.mutate(
      {
        email: credentials.email,
        password: credentials.password,
      },
      {
        onSuccess: (data) => {
          // ✅ Save token
          // localStorage.setItem("token", data.token);

          toast({
            title: "Welcome Back",
            description: "Successfully logged in to CryptoExec Platform.",
          });

          const from =
            (location.state as { from?: { pathname: string } })?.from
              ?.pathname || "/";

          navigate(from, { replace: true });
        },

        onError: (error: any) => {
          toast({
            title: "Login Failed",
            description:
              error?.response?.data?.message || "Invalid email or password.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSignupForm()) return;

    setLoading(true);

    try {
      const { error } = await signUp(
        signupData.email,
        signupData.password,
        signupData.fullName,
        signupData.mobileNumber
      );

      if (error) {
        let errorMessage = error.message;

        if (error.message.includes("already registered")) {
          errorMessage = "This email is already registered. Please sign in.";
        }

        toast({
          title: "Signup Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Account Created",
        description:
          "Your account has been created. You can now sign in with demo credentials.",
      });
      setIsSignup(false);
      setCredentials({ email: "admin@cryptoexec.com", password: "" });
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (requires2FA) {
    return <TwoFactorVerification onBack={() => setRequires2FA(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-surface flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 bg-accent rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-primary-foreground rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-primary-foreground">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center shadow-gold">
              <Shield className="w-7 h-7 text-accent-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold">CryptoExec</h1>
              <p className="text-primary-foreground/70">Execution Platform</p>
            </div>
          </div>

          <h2 className="text-4xl font-heading font-bold leading-tight mb-6">
            Secure Bank to Crypto
            <br />
            Execution Workflow
          </h2>

          <p className="text-lg text-primary-foreground/80 max-w-md">
            Enterprise-grade fiat to crypto conversion with dual-approval
            workflows, complete audit trails, and automated settlement.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-8">
            <div>
              <p className="text-3xl font-heading font-bold text-accent">
                $15M+
              </p>
              <p className="text-sm text-primary-foreground/70">
                Volume Processed
              </p>
            </div>
            <div>
              <p className="text-3xl font-heading font-bold text-accent">
                100%
              </p>
              <p className="text-sm text-primary-foreground/70">
                Audit Compliant
              </p>
            </div>
            <div>
              <p className="text-3xl font-heading font-bold text-accent">47</p>
              <p className="text-sm text-primary-foreground/70">Executions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login/Signup Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-primary">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold">CryptoExec</h1>
              <p className="text-sm text-muted-foreground">
                Execution Platform
              </p>
            </div>
          </div>

          {isSignup ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-heading font-bold text-foreground">
                  Create Account
                </h2>
                <p className="text-muted-foreground mt-2">
                  Set up your first Super Admin account
                </p>
              </div>

              <form onSubmit={handleSignup} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Smith"
                    value={signupData.fullName}
                    onChange={(e) =>
                      setSignupData({ ...signupData, fullName: e.target.value })
                    }
                    className={`h-12 ${
                      errors.fullName ? "border-destructive" : ""
                    }`}
                    disabled={loading}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupEmail">Corporate Email</Label>
                  <Input
                    id="signupEmail"
                    type="email"
                    placeholder="admin@company.com"
                    value={signupData.email}
                    onChange={(e) =>
                      setSignupData({ ...signupData, email: e.target.value })
                    }
                    className={`h-12 ${
                      errors.email ? "border-destructive" : ""
                    }`}
                    disabled={loading}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Mobile Number (Optional)</Label>
                  <Input
                    id="mobileNumber"
                    type="tel"
                    placeholder="+971 50 123 4567"
                    value={signupData.mobileNumber}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        mobileNumber: e.target.value,
                      })
                    }
                    className="h-12"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupPassword">Password</Label>
                  <div className="relative">
                    <Input
                      id="signupPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={signupData.password}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          password: e.target.value,
                        })
                      }
                      className={`h-12 pr-10 ${
                        errors.password ? "border-destructive" : ""
                      }`}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  size="xl"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Create Super Admin Account
                    </>
                  )}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{" "}
                <button
                  onClick={() => setIsSignup(false)}
                  className="text-primary hover:underline font-medium"
                >
                  Sign In
                </button>
              </p>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-heading font-bold text-foreground">
                  Welcome Back
                </h2>
                <p className="text-muted-foreground mt-2">
                  Sign in to access the execution platform
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@bank.ae"
                    value={credentials.email}
                    onChange={(e) =>
                      setCredentials({ ...credentials, email: e.target.value })
                    }
                    className={`h-12 ${
                      errors.email ? "border-destructive" : ""
                    }`}
                    disabled={loading}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={credentials.password}
                      onChange={(e) =>
                        setCredentials({
                          ...credentials,
                          password: e.target.value,
                        })
                      }
                      className={`h-12 pr-10 ${
                        errors.password ? "border-destructive" : ""
                      }`}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  size="xl"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              {/* Demo Credentials Box */}
              <div className="mt-6 p-4 bg-muted/50 border border-border rounded-xl">
                <div className="flex items-start gap-2 mb-3">
                  <Info className="w-4 h-4 text-primary mt-0.5" />
                  <p className="text-sm font-medium text-foreground">
                    Demo Credentials
                  </p>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Super Admin:</span>
                    <span className="font-mono">
                      admin@cryptoexec.com / Admin@123
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Initiator:</span>
                    <span className="font-mono">
                      initiator@bank.ae / Initiator@123
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Approver:</span>
                    <span className="font-mono">
                      approver@bank.ae / Approver@123
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Auditor:</span>
                    <span className="font-mono">
                      auditor@bank.ae / Auditor@123
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-center text-sm text-muted-foreground mt-4">
                Protected by enterprise-grade security.
                <br />
                Contact your administrator for access.
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// 2FA Verification Component
function TwoFactorVerification({ onBack }: { onBack: () => void }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { verify2FA } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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

    const { error } = await verify2FA(code);

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
      title: "Welcome Back",
      description: "Successfully verified and logged in.",
    });

    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-surface flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-card border border-border rounded-2xl p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-foreground">
            Two-Factor Authentication
          </h2>
          <p className="text-muted-foreground mt-2">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              type="text"
              placeholder="000000"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="h-14 text-center text-2xl font-mono tracking-[0.5em]"
              maxLength={6}
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            variant="gold"
            size="xl"
            className="w-full"
            disabled={loading || code.length !== 6}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify & Continue"
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={onBack}
            disabled={loading}
          >
            Back to Login
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

export default Login;
