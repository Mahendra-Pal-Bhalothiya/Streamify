import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../lib/api";

const useLogin = () => {
  const queryClient = useQueryClient();
  
  const { mutate, isPending, error } = useMutation({
    mutationFn: async (loginData) => {
      console.log("🟡 useLogin - mutationFn started with:", loginData);
      try {
        const response = await login(loginData);
        console.log("🟡 useLogin - API response received:", response);
        return response;
      } catch (err) {
        console.error("🟡 useLogin - API error:", err);
        throw err;
      }
    },
    onSuccess: (data) => {
      console.log("🟢 useLogin - onSuccess triggered with:", data);
      
      if (data.token) {
        localStorage.setItem("token", data.token);
        console.log("🟢 Token stored");
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        console.log("🟢 User stored:", data.user);
      }
      
      queryClient.setQueryData(["authUser"], { user: data.user });
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      
      console.log("🟢 useLogin - completed successfully");
    },
    onError: (error) => {
      console.error("🔴 useLogin - error:", error);
    },
  });

  return { error, isPending, loginMutation: mutate };
};

export default useLogin;