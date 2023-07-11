/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Measures the total success or failures for the verification step when signing up
 */
export interface WebCoreSignupVerificationStepVerificationTotal {
  Value: number;
  Labels: {
    status: "success" | "cancelled" | "failure" | "4xx" | "5xx";
    application: "proton-vpn-settings" | "proton-account";
  };
}
