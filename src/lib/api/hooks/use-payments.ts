"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { payments } from "../endpoints";
import type { CheckoutResult, CreatePaymentRequest, Payment } from "../types";

export function usePayments() {
  return useQuery<Payment[]>({
    queryKey: ["payments"],
    queryFn: () => payments.list(),
  });
}

export function usePayment(id: string, enabled = true) {
  return useQuery<Payment>({
    queryKey: ["payments", id],
    queryFn: () => payments.get(id),
    enabled: enabled && !!id,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePaymentRequest) => payments.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });
}

export function useResumePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => payments.resume(id),
    onSuccess: (result: CheckoutResult) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      if (result.payment?.id) {
        queryClient.invalidateQueries({ queryKey: ["payments", result.payment.id] });
      }
    },
  });
}
