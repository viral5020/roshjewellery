import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { loginFormControls } from "@/config";
import { loginUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import img from "../../assets/goog.png";
import "../../../src/google.css";

const initialState = {
  email: "",
  password: "",
};

const loginwithgoogle = () => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
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
          title: data?.payload?.message,
        });
      } else {
        toast({
          title: data?.payload?.message,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Sign in to your account
        </h1>
        <p className="mt-2">
          Don't have an account?
          <Link
            className="font-medium ml-2 text-primary hover:underline"
            to="/auth/register"
          >
            Register
          </Link>
        </p>
      </div>
      <CommonForm
        formControls={loginFormControls}
        buttonText={"Sign In"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />

      {/* Centered Sign In with Google Button */}
      <div className="flex justify-center items-center">
        <button
          className="login-with-google-btn"
          onClick={loginwithgoogle}
        >
          <img
            src={img} // Assuming the image is imported or from a URL
            alt="Google logo"
            className="google-logo"
          />
          Sign In With Google
        </button>
      </div>

      {/* Forgot Password Link */}
      <div className="text-center mt-4">
        <Link
          to="/auth/forgotpassword"
          className="font-medium text-primary hover:underline"
        >
          Forgot Password?
        </Link>
      </div>
    </div>
  );
}

export default AuthLogin;
