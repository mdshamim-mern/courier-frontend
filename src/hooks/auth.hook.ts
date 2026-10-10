import {
  forgotPassword,
  googleOAuth,
  registerCustomer,
  resetPassword,
  userLogin,
  userLogout,
  verifyEmail,
} from "@/api";
import { clearAccessToken } from "@/lib/auth-token";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function useSessionMutation<TPayload, TResult>(
  mutationFn: (payload: TPayload) => Promise<TResult>,
  errorToastHandled = false,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    meta: { errorToastHandled },
    onSuccess: () => {
      clearAccessToken();
      queryClient.clear();
    },
  });
}
export const useRegistration = () =>
  useMutation({ mutationFn: registerCustomer });
export const useVerifyEmail = () => useSessionMutation(verifyEmail);
export const useLogin = () => useSessionMutation(userLogin, true);
export const useGoogleOAuth = () => useSessionMutation(googleOAuth);
export const useForgotPassword = () =>
  useMutation({ mutationFn: forgotPassword });
export const useResetPassword = () => useSessionMutation(resetPassword);
export const useLogout = () => useSessionMutation(userLogout);
