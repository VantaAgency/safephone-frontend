"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { contact, partnerApplications } from "../endpoints";
import type { CreateContactRequest, CreatePartnerApplicationRequest, PartnerApplication } from "../types";

export function useSubmitContact() {
  return useMutation({
    mutationFn: (data: CreateContactRequest) => contact.submit(data),
  });
}

export function useSubmitPartnerApplication() {
  return useMutation({
    mutationFn: (data: CreatePartnerApplicationRequest) => partnerApplications.submit(data),
  });
}

export function useMyPartnerApplication(enabled = true) {
  return useQuery<PartnerApplication>({
    queryKey: ["my-partner-application"],
    queryFn: () => partnerApplications.mine(),
    enabled,
    retry: false,
  });
}
