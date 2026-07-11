import { useToast } from "@/components/ui/use-toast";
import { loginUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import img from "../../assets/goog.png";

const initialState = {
  email: "",
  password: "",
};

const loginwithgoogle = () => {
  const getBackendUrl = () => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    return import.meta.env.VITE_API_URL || 'https://server.roshfinejewellery.com';
  };
  const baseUrl = getBackendUrl();
  window.open(`${baseUrl}/auth/google`, "_self");
};

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function onSubmit(event) {
    event.preventDefault();

    dispatch(loginUser(formData)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: data?.payload?.message || "Logged in successfully",
        });
      } else {
        toast({
          title: data?.payload?.message || "Login failed",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="w-full space-y-8">
      {/* Title */}
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-serif italic text-rosh-primary mb-2">
          Sign In
        </h2>
        <p className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/60">
          Access your personal workspace
        </p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Email field */}
          <div className="flex flex-col">
            <label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/70 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="border-0 border-b border-rosh-primary/20 rounded-none px-0 py-3 focus:outline-none focus:ring-0 outline-none bg-transparent text-sm shadow-none placeholder:text-rosh-primary/30 transition-colors focus:border-rosh-primary"
              required
            />
          </div>

          {/* Password field */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/70">
                Password
              </label>
              <Link
                to="/auth/forgotpassword"
                className="text-[10px] uppercase tracking-[0.1em] text-rosh-accent hover:text-rosh-primary transition-colors"
              >
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="border-0 border-b border-rosh-primary/20 rounded-none px-0 py-3 focus:outline-none focus:ring-0 outline-none bg-transparent text-sm shadow-none placeholder:text-rosh-primary/30 transition-colors focus:border-rosh-primary"
              required
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-4 pt-4">
          <button
            type="submit"
            className="w-full bg-rosh-primary text-rosh-background py-4 text-[10px] uppercase tracking-[0.3em] hover:bg-rosh-accent hover:text-white transition-all duration-300"
          >
            Sign In
          </button>

          {/* Google Sign In */}
          <button
            type="button"
            className="w-full border border-rosh-primary/20 hover:border-rosh-primary bg-transparent text-rosh-primary py-3.5 text-[10px] uppercase tracking-[0.2em] hover:bg-rosh-primary/5 transition-all duration-300 flex items-center justify-center gap-3"
            onClick={loginwithgoogle}
          >
            <img
              src={img}
              alt="Google logo"
              className="w-4 h-4 object-contain"
            />
            Sign In With Google
          </button>
        </div>
      </form>

      {/* Register Link */}
      <div className="text-center text-xs tracking-wide text-rosh-primary/60">
        Don't have an account?{" "}
        <Link
          to="/auth/register"
          className="font-medium text-rosh-accent hover:text-rosh-primary transition-colors uppercase tracking-[0.1em] text-[10px] ml-1 border-b border-rosh-accent/40 pb-0.5"
        >
          Register here
        </Link>
      </div>
    </div>
  );
}

export default AuthLogin;
