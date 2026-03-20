"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { payments } from "../endpoints";
import type {
  CheckoutResult,
  CreatePaymentRequest,
  Payment,
  RenewSubscriptionPaymentRequest,
} from "../types";

interface PaymentQueryOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
}

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

export function usePaymentCheckout(
  id: string,
  { enabled = true, refetchInterval = false }: PaymentQueryOptions = {},
) {
  return useQuery<CheckoutResult>({
    queryKey: ["payments", id, "checkout"],
    queryFn: () => payments.checkout(id),
    enabled: enabled && !!id,
    refetchInterval,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePaymentRequest) => payments.create(data),
    onSuccess: (result: CheckoutResult) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      if (result.payment?.id) {
        queryClient.invalidateQueries({
          queryKey: ["payments", result.payment.id, "checkout"],
        });
      }
    },
  });
}

export function useRenewSubscriptionPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RenewSubscriptionPaymentRequest) =>
      payments.renewSubscription(data),
    onSuccess: (result: CheckoutResult) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      if (result.payment?.id) {
        queryClient.invalidateQueries({ queryKey: ["payments", result.payment.id] });
        queryClient.invalidateQueries({
          queryKey: ["payments", result.payment.id, "checkout"],
        });
      }
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
        queryClient.invalidateQueries({
          queryKey: ["payments", result.payment.id, "checkout"],
        });
      }
    },
  });
}
