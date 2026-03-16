"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { payments } from "../endpoints";
import type { CreatePaymentRequest, Payment } from "../types";

export function usePayments() {
  return useQuery<Payment[]>({
    queryKey: ["payments"],
    queryFn: () => payments.list(),
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePaymentRequest) => payments.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}
