import { useMutation } from "@tanstack/react-query";
import { authService } from "@/service/auth.service";

export function useAdminLogin() {
  return useMutation({
    mutationFn: authService.login,
  });
}
