"use client";

import React, { useEffect } from "react";
import { Amplify } from "aws-amplify";
import {
  Authenticator,
  Heading,
  Link,
  Radio,
  RadioGroupField,
  useAuthenticator,
  View,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { useRouter, usePathname } from "next/navigation";

// Move Amplify configuration inside a useEffect to avoid SSR issues
const configureAmplify = () => {
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
};

const components = {
  Header() {
    return (
      <View className="mt-4 mb-7">
        <Heading level={3} className="!text-2xl !font-bold">
          RENT
          <span className="text-secondary-400 font-light hover:text-secondary-500">
            AI
          </span>
        </Heading>
        <p className="text-sm text-gray-500">
          Sign in to your account to continue
        </p>
      </View>
    );
  },
  SignIn: {
    Footer() {
      return (
        <View className="mt-4 flex flex-col items-center justify-center">
          <p className="text-sm text-gray-500">Don&apos;t have an account?</p>
          <Link href="/signup" className="text-secondary-500">
            <span className="text-secondary-400 font-bold hover:text-secondary-500">
              Sign up
            </span>
          </Link>
        </View>
      );
    },
  },
  SignUp: {
    FormFields() {
      const { validationErrors } = useAuthenticator((context) => [
        context.validationErrors,
      ]);

      return (
        <>
          <Authenticator.SignUp.FormFields />
          <RadioGroupField
            name="custom:role"
            legend="Role"
            errorMessage={validationErrors?.["custom:role"]}
            hasError={!!validationErrors?.["custom:role"]}
            isRequired
          >
            <Radio value="tenant">Tenant</Radio>
            <Radio value="manager">Manager</Radio>
          </RadioGroupField>
        </>
      );
    },
    Footer() {
      return (
        <View className="mt-4 flex flex-col items-center justify-center">
          <p className="text-sm text-gray-500">Already have an account?</p>
          <Link href="/signin" className="text-secondary-500">
            <span className="text-secondary-400 font-bold hover:text-secondary-500">
              Sign in
            </span>
          </Link>
        </View>
      );
    },
  },
};

const formFields = {
  signIn: {
    username: {
      placeholder: "Enter your email",
      label: "Email",
      isRequired: true,
    },
    password: {
      placeholder: "Enter your password",
      label: "Password",
      isRequired: true,
    },
  },
  signUp: {
    username: {
      order: 1,
      placeholder: "Choose a username",
      label: "Username",
      isRequired: true,
    },
    email: {
      order: 2,
      placeholder: "Enter your email address",
      label: "Email",
      isRequired: true,
    },
    password: {
      order: 3,
      placeholder: "Create a password",
      label: "Password",
      isRequired: true,
    },
    confirm_password: {
      order: 4,
      placeholder: "Confirm your password",
      label: "Confirm Password",
      isRequired: true,
    },
  },
};

const Auth = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthenticator((context) => [context.user]);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname.match(/^\/(signin|signup)$/);
  const isDashboardPage =
    pathname.startsWith("/manager") || pathname.startsWith("/tenants");

  // Configure Amplify on client side
  useEffect(() => {
    configureAmplify();
  }, []);

  // Redirect authenticated users away from auth pages
  useEffect(() => {
    if (user && isAuthPage) {
      router.push("/");
    }
  }, [user, isAuthPage, router]);

  // Allow access to public pages without authentication
  if (!isAuthPage && !isDashboardPage) {
    return <>{children}</>;
  }

  return (
    <div className="h-full">
      <Authenticator
        initialState={pathname.includes("signup") ? "signUp" : "signIn"}
        components={components}
        formFields={formFields}
      >
        {() => <>{children}</>}
      </Authenticator>
    </div>
  );
};

export default Auth;
