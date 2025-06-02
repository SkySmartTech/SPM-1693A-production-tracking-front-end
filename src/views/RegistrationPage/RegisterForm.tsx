import {
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  CardContent,
  Stack,
  CircularProgress,
} from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../../api/userApi";
import { User } from "../../api/userApi";

interface RegisterFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

const departments = ["HR", "Finance", "Production", "IT"];
const userTypes = ["Admin", "Employee"];
const availabilityOptions = ["Available", "Unavailable"];
const statusOptions = ["Active", "Inactive"];

interface FormData extends Omit<User, 'availability'> {
  availability: string;
  status: string;
  confirmPassword: string; // Added for password confirmation
}

const RegisterForm = ({ onSuccess, onError }: RegisterFormProps) => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const password = watch("password");

  const { mutate: registerMutation, isPending } = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      onSuccess();
      navigate("/login");
    },
    onError: (error: any) => {
      onError(error.response?.data?.message || "Registration failed");
    },
  });

  const onSubmit = (data: FormData) => {
    const userData: any = {
      ...data,
      availability: data.availability === "Available",
      password_confirmation: data.confirmPassword, // Important for backend validation
    };
    registerMutation(userData);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 500 }}>
      <CardContent sx={{ textAlign: "center" }}>
        <img src="/images/lgo1.png" alt="Buildtek Logo" width="50px" />
        <Typography variant="h5" fontWeight="bold">Smart Flow</Typography>
        <Typography variant="subtitle1" fontWeight="bold">
          Seamless Production, Smarter Management
        </Typography>
        <Typography variant="h6" fontWeight="bold" mt={1} sx={{ textAlign: "left" }}>
          Sign Up
        </Typography>
      </CardContent>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <TextField
              label="EPF"
              fullWidth
              variant="outlined"
              {...register("epf", { required: "EPF is required" })}
              error={!!errors.epf}
              helperText={errors.epf?.message}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", height: "52px" } }}
            />
            <TextField
              label="Employee Name"
              fullWidth
              variant="outlined"
              {...register("employeeName", { required: "Name is required" })}
              error={!!errors.employeeName}
              helperText={errors.employeeName?.message}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", height: "52px" } }}
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Username"
              fullWidth
              variant="outlined"
              {...register("username", {
                required: "Username is required",
                minLength: {
                  value: 3,
                  message: "Username must be at least 3 characters",
                },
              })}
              error={!!errors.username}
              helperText={errors.username?.message}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", height: "52px" } }}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              variant="outlined"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", height: "52px" } }}
            />
          </Stack>

          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            variant="outlined"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === password || "Passwords do not match",
            })}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", height: "52px" } }}
          />

          <Stack direction="row" spacing={2}>
            <TextField
              select
              label="Department"
              fullWidth
              variant="outlined"
              {...register("department", { required: "Department is required" })}
              error={!!errors.department}
              helperText={errors.department?.message}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", height: "52px" } }}
            >
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Contact"
              fullWidth
              variant="outlined"
              {...register("contact")}
              error={!!errors.contact}
              helperText={errors.contact?.message}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", height: "52px" } }}
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", height: "52px" } }}
            />
            <TextField
              select
              label="User Type"
              fullWidth
              variant="outlined"
              {...register("userType", { required: "User type is required" })}
              error={!!errors.userType}
              helperText={errors.userType?.message}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", height: "52px" } }}
            >
              {userTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              select
              label="Availability"
              fullWidth
              variant="outlined"
              defaultValue="Available"
              {...register("availability")}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", height: "52px" } }}
            >
              {availabilityOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Status"
              fullWidth
              variant="outlined"
              defaultValue="Active"
              {...register("status")}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", height: "52px" } }}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Stack>

        <Box sx={{ mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isPending}
            sx={{
              height: 48,
              fontSize: "1rem",
              fontWeight: "bold",
              textTransform: "none",
            }}
          >
            {isPending ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Sign Up"
            )}
          </Button>
        </Box>

        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Link to="/login" style={{ textDecoration: "none" }}>
            <Button
              startIcon={<AccountCircle />}
              sx={{
                textTransform: "none",
                color: "primary.main",
              }}
            >
              Already have an account? Sign In
            </Button>
          </Link>
        </Box>
      </form>
    </Box>
  );
};

export default RegisterForm;
