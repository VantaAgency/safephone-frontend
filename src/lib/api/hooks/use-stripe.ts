"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { stripe } from "../endpoints";
import type {
  BillingCycle,
  StripeCheckoutResponse,
  StripeRegisterDeviceRequest,
  StripeRegisterDeviceResponse,
} from "../endpoints";

export interface StripeCheckoutVars {
  planSlug: string;
  billingCycle?: BillingCycle;
}

export function useStripeCheckout() {
  return useMutation<StripeCheckoutResponse, Error, StripeCheckoutVars>({
    mutationFn: ({ planSlug, billingCycle }) =>
      stripe.createCheckout(planSlug, billingCycle ?? "monthly"),
  });
}

export function useRegisterUSDevice() {
  const queryClient = useQueryClient();
  return useMutation<
    StripeRegisterDeviceResponse,
    Error,
    StripeRegisterDeviceRequest
  >({
    mutationFn: (data) => stripe.registerDevice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
  });
}
