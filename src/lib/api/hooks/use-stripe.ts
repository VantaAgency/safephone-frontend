"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { stripe } from "../endpoints";
import type {
  StripeCheckoutResponse,
  StripeRegisterDeviceRequest,
  StripeRegisterDeviceResponse,
} from "../endpoints";

export function useStripeCheckout() {
  return useMutation<StripeCheckoutResponse, Error, string>({
    mutationFn: (planSlug) => stripe.createCheckout(planSlug),
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
