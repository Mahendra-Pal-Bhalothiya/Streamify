import { useState, useEffect, useRef } from "react";
import { ShipWheelIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useLogin from "../hooks/useLogin";
import toast from "react-hot-toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [loginError, setLoginError] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigationInProgress = useRef(false);
  const redirectAttempted = useRef(false);

  const { isPending, error: loginMutationError, loginMutation } = useLogin();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = () => {
      if (redirectAttempted.current) {
        if (isMounted) setIsCheckingAuth(false);
        return;
      }

      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      console.log("Checking auth - token:", token ? "Present" : "Missing");
      console.log("Checking auth - user:", user ? "Present" : "Missing");

      if (token && user) {
        try {
          const userData = JSON.parse(user);
          console.log("User already logged in:", userData);

          redirectAttempted.current = true;
          navigationInProgress.current = true;

          setTimeout(() => {
            if (isMounted) {
              if (userData.isOnboarded) {
                console.log("Redirecting to dashboard via navigate");
                navigate("/dashboard", { replace: true });
              } else {
                console.log("Redirecting to onboarding via navigate");
                navigate("/onboarding", { replace: true });
              }
            }
          }, 100);
        } catch (e) {
          console.error("Error parsing user:", e);
          if (isMounted) setIsCheckingAuth(false);
        }
      } else {
        if (isMounted) setIsCheckingAuth(false);
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      setLoginError("Email and password are required");
      return;
    }

    setLoginError(null);

    console.log("🔵 Step 1: Calling loginMutation with:", loginData);

    loginMutation(loginData, {
      onSuccess: async (data) => {
        console.log("🔵 Step 2: Login successful, data received:", data);

        await new Promise((resolve) => setTimeout(resolve, 100));

        const token = localStorage.getItem("token");
        console.log("🔵 Token after delay:", token ? "Present" : "Missing");

        try {
          const response = await fetch("http://localhost:5001/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const userData = await response.json();
          console.log("🔵 Manual user fetch:", userData);
        } catch (error) {
          console.error("🔵 Manual fetch error:", error);
        }

        toast.success("Logged in successfully!");

        setTimeout(() => {
          if (data.user?.isOnboarded) {
            console.log("🔵 Doing hard redirect to dashboard");
            window.location.href = "/dashboard";
          } else {
            console.log("🔵 Doing hard redirect to onboarding");
            window.location.href = "/onboarding";
          }
        }, 500);
      },
      onError: (err) => {
        console.error("🔴 ERROR: Login failed:", err);
        setLoginError(err.response?.data?.message || "Login failed");
        toast.error(err.response?.data?.message || "Login failed");
      },
    });
  };

  if (isCheckingAuth) {
    return (
      <div className="h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div
      className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
      data-theme="forest"
    >
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
        {/* LOGIN FORM SECTION */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          {/* LOGO */}
          <div className="mb-4 flex items-center justify-start gap-2">
            <ShipWheelIcon className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              Streamify
            </span>
          </div>

          {/* ERROR MESSAGE DISPLAY */}
          {(loginMutationError || loginError) && (
            <div className="alert alert-error mb-4">
              <span>
                {loginMutationError?.response?.data?.message ||
                  loginMutationError?.message ||
                  loginError ||
                  "An error occurred"}
              </span>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Welcome Back</h2>
                  <p className="text-sm opacity-70">
                    Sign in to your account to continue your language journey
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="form-control w-full space-y-2">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="hello@example.com"
                      className="input input-bordered w-full"
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-control w-full space-y-2">
                    <label className="label">
                      <span className="label-text">Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="input input-bordered w-full"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>

                  <div className="text-center mt-4">
                    <p className="text-sm">
                      Don't have an account?{" "}
                      <Link
                        to="/signup"
                        className="text-primary hover:underline"
                      >
                        Create one
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* IMAGE SECTION */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8">
            <div className="relative aspect-square max-w-sm mx-auto">
              <img
                src="/i.png"
                alt="Language connection illustration"
                className="w-full h-full"
                onError={(e) => {
                  console.log("Image failed to load");
                  e.target.style.display = "none";
                }}
              />
            </div>
            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">
                Connect with language partners worldwide
              </h2>
              <p className="opacity-70">
                Practice conversations, make friends, and improve your language
                skills together
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
