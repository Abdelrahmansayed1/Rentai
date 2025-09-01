import { createNewUserInDatabase } from "@/lib/utils";
import { Manager, Tenant } from "@/types/prismaTypes";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers) => {
      const session = await fetchAuthSession();
      const { idToken } = session.tokens ?? {};
      if (idToken) {
        headers.set("Authorization", `Bearer ${idToken}`);
      }
      return headers;
    },
  }),
  reducerPath: "api",
  tagTypes: ["Managers", "Tenants"],
  endpoints: (build) => ({
    getAuthUser: build.query<User, void>({
      queryFn: async (_, _queryApi, _extraOptions, fetchWithBQ) => {
        try {
          const session = await fetchAuthSession();
          const { idToken } = session.tokens ?? {};
          const user = await getCurrentUser();
          const userRole = idToken?.payload["custom:role"];
          const endPoint =
            userRole === "tenant"
              ? `/tenants/${user.userId}`
              : `/managers/${user.userId}`;
          let response = await fetchWithBQ(endPoint);
          if (response.error && response.error.status === 404) {
            response = await createNewUserInDatabase(
              user,
              idToken,
              userRole as string,
              fetchWithBQ
            );
          }
          return {
            data: {
              cognitoInfo: { ...user },
              userInfo: response.data as Tenant | Manager,
              userRole,
            },
          };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          return {
            error: error?.message || ("Couldn't get user info" as string),
          };
        }
      },
      providesTags: (result) => {
        if (!result) return [];

        const userRole = result.userRole as string;
        if (userRole === "tenant" && result.userInfo?.id) {
          return [{ type: "Tenants", id: result.userInfo.id }];
        }
        if (userRole === "manager" && result.userInfo?.id) {
          return [{ type: "Managers", id: result.userInfo.id }];
        }
        return [];
      },
    }),
    updateTenant: build.mutation<
      Tenant,
      { cognitoId: string; data: Partial<Tenant> }
    >({
      query: ({ cognitoId, data }) => ({
        url: `/tenants/${cognitoId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result) => [{ type: "Tenants", id: result?.id }],
    }),
    updateManager: build.mutation<
      Manager,
      { cognitoId: string; data: Partial<Manager> }
    >({
      query: ({ cognitoId, data }) => ({
        url: `/managers/${cognitoId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result) => [{ type: "Managers", id: result?.id }],
    }),
  }),
});

export const {
  useGetAuthUserQuery,
  useUpdateTenantMutation,
  useUpdateManagerMutation,
} = api;
