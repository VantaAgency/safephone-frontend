"use client";

import { useMutation } from "@tanstack/react-query";
import { users } from "../endpoints";
import type { UpdateProfileRequest } from "../types";

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => users.updateProfile(data),
  });
}
