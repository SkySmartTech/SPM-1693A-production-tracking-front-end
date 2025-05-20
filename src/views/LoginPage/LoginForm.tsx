import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  CardContent,
  CircularProgress,
} from "@mui/material";
import { AccountCircle, Info } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../../services/authService";

interface LoginFormProps {
  onForgotPasswordClick: () => void;
}

interface LoginFormData {
  username: string;
  password: string;
}


const LoginForm = ({ onForgotPasswordClick }: LoginFormProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    const rememberedUsername = localStorage.getItem("rememberedUsername");
    if (rememberedUsername) {
      setRememberMe(true);
      setValue("username", rememberedUsername);
    }
  }, [setValue]);

  const { mutate: loginMutation, isPending } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      localStorage.setItem("token", data?.token);
      enqueueSnackbar("Welcome Back!", { variant: "success" });
      navigate("/home");
    },
    onError: () => {
      enqueueSnackbar(`Login Failed`, {
        variant: "error",
      });
    },
  });

  const onSubmit = (data: { username: string; password: string }) => {
    loginMutation(data);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 500 }}>
      <CardContent sx={{ textAlign: "center" }}>
        <img src="/images/lgo1.png" alt="Buildtek Logo" width="50px" />
        <Typography variant="h5" fontWeight="bold">
          Smart Flow
        </Typography>
        <Typography variant="subtitle1" fontWeight="bold">
          Seamless Production, Smarter Management
        </Typography>
        <Typography variant="h6" fontWeight="bold" mt={1} sx={{ textAlign: "left" }}>
          Sign In
        </Typography>
      </CardContent>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="Username"
          fullWidth
          variant="outlined"
          margin="normal"
          {...register("username", {
            required: "Username is required",
            minLength: {
              value: 3,
              message: "Username must be at least 3 characters",
            },
          })}
          error={!!errors.username}
          helperText={errors.username?.message}
          sx={{ mb: 2 }}
          autoComplete="username"
          autoFocus
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          variant="outlined"
          margin="normal"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
          error={!!errors.password}
          helperText={errors.password?.message}
          sx={{ mb: 2 }}
          autoComplete="current-password"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              color="primary"
            />
          }
          label="Remember me"
          sx={{ mb: 2 }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={isPending}
          sx={{ 
            mb: 2, 
            height: 48,
            fontSize: '1rem',
            fontWeight: 'bold',
            textTransform: 'none'
          }}
        >
          {isPending ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Sign In"
          )}
        </Button>

        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between",
          alignItems: 'center',
          mt: 2
        }}>
          <Button
            startIcon={<Info />}
            onClick={onForgotPasswordClick}
            sx={{ 
              textTransform: "none",
              color: 'text.secondary'
            }}
          >
            Forgot password?
          </Button>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <Button 
              startIcon={<AccountCircle />} 
              sx={{ 
                textTransform: "none",
                color: 'primary.main'
              }}
            >
              Create account
            </Button>
          </Link>
        </Box>
      </form>
    </Box>
  );
};

export default LoginForm;