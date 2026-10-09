import { getMe, updateMyProfile, updateProfileImage } from "@/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetMe() {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: getMe,
    retry: false,
  });
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
}

export function useUpdateProfileImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfileImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
}
