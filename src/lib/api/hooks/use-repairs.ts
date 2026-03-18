"use client";

import { useMutation } from "@tanstack/react-query";
import { repairs } from "../endpoints";
import type { CreateRepairBookingRequest } from "../types";

export function useCreateRepairBooking() {
  return useMutation({
    mutationFn: (data: CreateRepairBookingRequest) => repairs.createBooking(data),
  });
}
