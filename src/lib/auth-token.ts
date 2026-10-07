export const clearAccessToken = () => {
  if (typeof window !== "undefined") localStorage.removeItem("accessToken");
};
