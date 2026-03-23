import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../lib/api";

const useAuthUser = () => {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  
  console.log("useAuthUser - token exists:", !!token);
  console.log("useAuthUser - storedUser:", storedUser);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["authUser"],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 0,
    enabled: !!token,
  });

  console.log("useAuthUser - query data:", data);
  console.log("useAuthUser - isLoading:", isLoading);

  let user = null;
  
  if (data && data.user) {
    user = data.user;
  } else if (storedUser) {
    try {
      user = JSON.parse(storedUser);
      console.log("useAuthUser - using stored user as fallback:", user);
    } catch (e) {
      console.error("Error parsing stored user:", e);
    }
  }

  return { 
    isLoading, 
    authUser: user,
    isAuthenticated: !!user,
    refetch,
    error
  };
};

export default useAuthUser;