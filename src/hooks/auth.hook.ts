import {
  forgotPassword,
  googleOAuth,
  registerCustomer,
  resetPassword,
  userLogin,
  userLogout,
  verifyEmail,
} from "@/api";
import { useMutation } from "@tanstack/react-query";

export function useRegistration() {
  return useMutation({
    mutationFn: registerCustomer,
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: verifyEmail,
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: userLogin,
  });
}

export function useGoogleOAuth() {
  return useMutation({
    mutationFn: googleOAuth,
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: forgotPassword,
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: resetPassword,
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: userLogout,
  });
}