import { useToast } from "@/components/ui/use-toast";
import { registerUser, loginUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

const initialState = {
  userName: "",
  email: "",
  password: "",
};

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const { toast } = useToast();

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const registerResult = await dispatch(registerUser(formData)).unwrap();
      
      if (registerResult?.success) {
        toast({
          title: registerResult?.message || "Registration successful",
        });
        
        // Automatically log in the user after successful registration
        const loginResult = await dispatch(loginUser({
          email: formData.email,
          password: formData.password
        })).unwrap();
        
        if (loginResult?.success) {
          return;
        }
      } else {
        toast({
          title: registerResult?.message || "Registration failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: error?.message || "Registration failed",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="w-full space-y-8">
      {/* Title */}
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-serif italic text-rosh-primary mb-2">
          Create Account
        </h2>
        <p className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/60">
          Join Rosh Fine Jewellery client space
        </p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Username field */}
          <div className="flex flex-col">
            <label htmlFor="userName" className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/70 mb-1">
              Username
            </label>
            <input
              type="text"
              id="userName"
              placeholder="Enter your username"
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              className="border-0 border-b border-rosh-primary/20 rounded-none px-0 py-3 focus:outline-none focus:ring-0 outline-none bg-transparent text-sm shadow-none placeholder:text-rosh-primary/30 transition-colors focus:border-rosh-primary"
              required
            />
          </div>

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
            <label htmlFor="password" className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/70 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Create your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="border-0 border-b border-rosh-primary/20 rounded-none px-0 py-3 focus:outline-none focus:ring-0 outline-none bg-transparent text-sm shadow-none placeholder:text-rosh-primary/30 transition-colors focus:border-rosh-primary"
              required
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-rosh-primary text-rosh-background py-4 text-[10px] uppercase tracking-[0.3em] hover:bg-rosh-accent hover:text-white transition-all duration-300"
          >
            Sign Up
          </button>
        </div>
      </form>

      {/* Login Link */}
      <div className="text-center text-xs tracking-wide text-rosh-primary/60">
        Already have an account?{" "}
        <Link
          to="/auth/login"
          className="font-medium text-rosh-accent hover:text-rosh-primary transition-colors uppercase tracking-[0.1em] text-[10px] ml-1 border-b border-rosh-accent/40 pb-0.5"
        >
          Login here
        </Link>
      </div>
    </div>
  );
}

export default AuthRegister;
