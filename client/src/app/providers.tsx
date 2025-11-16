"use client";

import { Amplify } from "aws-amplify";
import StoreProvider from "@/state/redux";
import { Authenticator } from "@aws-amplify/ui-react";
import Auth from "./(auth)/auth-provider";

// Configure Amplify immediately on client side
if (typeof window !== "undefined") {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID || "",
        userPoolClientId:
          process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID || "",
      },
    },
  });
}

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <Authenticator.Provider>
        <Auth>{children}</Auth>
      </Authenticator.Provider>
    </StoreProvider>
  );
};

export default Providers;
