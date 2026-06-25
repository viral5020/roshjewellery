import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { registerFormControls } from "@/config";
import { registerUser, loginUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

const initialState = {
  userName: "",
  email: "",
  password: "",
};

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const registerResult = await dispatch(registerUser(formData)).unwrap();
      
      if (registerResult?.success) {
        toast({
          title: registerResult?.message,
        });
        
        // Automatically log in the user after successful registration
        const loginResult = await dispatch(loginUser({
          email: formData.email,
          password: formData.password
        })).unwrap();
        
        if (loginResult?.success) {
          // The login thunk will handle the redirection based on user role
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

  console.log(formData);

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Create new account
        </h1>
        <p className="mt-2">
          Already have an account
          <Link
            className="font-medium ml-2 text-primary hover:underline"
            to="/auth/login"
          >
            Login
          </Link>
        </p>
      </div>
      <CommonForm
        formControls={registerFormControls}
        buttonText={"Sign Up"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
    </div>
  );
}

export default AuthRegister;
