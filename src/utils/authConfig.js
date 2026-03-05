// ── NexusFlow Auth Configuration (AWS Cognito via Amplify) ──

import { Amplify } from "aws-amplify";

const cognitoConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || "",
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || "",
    },
  },
};

// Only configure if credentials are present
if (cognitoConfig.Auth.Cognito.userPoolId) {
  Amplify.configure(cognitoConfig);
}

export const isCognitoConfigured = () =>
  !!import.meta.env.VITE_COGNITO_USER_POOL_ID &&
  !!import.meta.env.VITE_COGNITO_CLIENT_ID;
