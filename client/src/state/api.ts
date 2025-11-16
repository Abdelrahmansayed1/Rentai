import { cleanParams, createNewUserInDatabase } from "@/lib/utils";
import { Manager, Property, Tenant } from "@/types/prismaTypes";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import { FiltersState } from ".";

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers) => {
      try {
        const session = await fetchAuthSession();
        const { idToken } = session.tokens ?? {};
        if (idToken) {
          headers.set("Authorization", `Bearer ${idToken}`);
        }
      } catch {
        // Silently fail - user may not be authenticated
      }
      return headers;
    },
  }),
  reducerPath: "api",
  tagTypes: ["Managers", "Tenants", "Properties"],
  endpoints: (build) => ({
    getAuthUser: build.query<User, void>({
      queryFn: async (_, _queryApi, _extraOptions, fetchWithBQ) => {
        try {
          // First check if user exists (this will throw if not authenticated)
          let user;
          try {
            user = await getCurrentUser();
          } catch {
            return {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data: null as any,
            };
          }

          // Now fetch session - may need to wait for tokens to be ready
          let session;
          let idToken;
          let retries = 0;
          const maxRetries = 5;

          while (retries < maxRetries) {
            try {
              session = await fetchAuthSession();
              idToken = session.tokens?.idToken;

              if (idToken) {
                break;
              } else {
                if (retries < maxRetries - 1) {
                  // Wait a bit before retrying (tokens might still be loading)
                  await new Promise((resolve) => setTimeout(resolve, 200));
                }
              }
            } catch {
              if (retries < maxRetries - 1) {
                await new Promise((resolve) => setTimeout(resolve, 200));
              }
            }
            retries++;
          }

          // If no session/token after retries, return null
          if (!idToken) {
            return {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data: null as any,
            };
          }

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
        } catch {
          // Return null instead of error to prevent retry loops
          return {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: null as any,
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
    getProperties: build.query<
      Property[],
      Partial<FiltersState> & { favoritesIds?: number[] }
    >({
      query: (filters) => {
        const params = cleanParams({
          location: filters.location,
          priceMin: filters.priceRange?.[0],
          priceMax: filters.priceRange?.[1],
          beds: filters.beds,
          baths: filters.baths,
          propertyType: filters.propertyType,
          squareFeetMin: filters.squareFeet?.[0],
          squareFeetMax: filters.squareFeet?.[1],
          favoritesIds: filters.favoritesIds?.join(","),
          amenities: filters.amenities,
          availableFrom: filters.availableFrom,
          latitude: filters.coordinates?.[1],
          longitude: filters.coordinates?.[0],
        });
        return {
          url: `properties`,
          params,
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((property) => ({
                type: "Properties" as const,
                id: property.id,
              })),
              { type: "Properties" as const, id: "LIST" },
            ]
          : [{ type: "Properties" as const, id: "LIST" }],
    }),
    addFavoriteProperty: build.mutation<
      Tenant,
      { cognitoId: string; propertyId: number }
    >({
      query: ({ cognitoId, propertyId }) => ({
        url: `/tenants/${cognitoId}/favorites/${propertyId}`,
        method: "POST",
      }),
      invalidatesTags: (result) => [
        { type: "Tenants", id: result?.id },
        { type: "Properties", id: "LIST" },
      ],
    }),
    removeFavoriteProperty: build.mutation<
      Tenant,
      { cognitoId: string; propertyId: number }
    >({
      query: ({ cognitoId, propertyId }) => ({
        url: `/tenants/${cognitoId}/favorites/${propertyId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result) => [
        { type: "Tenants", id: result?.id },
        { type: "Properties", id: "LIST" },
      ],
    }),
    getTenant: build.query<Tenant, string>({
      query: (cognitoId) => ({
        url: `/tenants/${cognitoId}`,
      }),
      providesTags: (result) => [{ type: "Tenants", id: result?.id }],
    }),
    getProperty: build.query<Property, string>({
      query: (id) => ({
        url: `/properties/${id}`,
      }),
      providesTags: (result) => [{ type: "Properties", id: result?.id }],
    }),
  }),
});

export const {
  useGetAuthUserQuery,
  useUpdateTenantMutation,
  useUpdateManagerMutation,
  useGetPropertiesQuery,
  useAddFavoritePropertyMutation,
  useRemoveFavoritePropertyMutation,
  useGetTenantQuery,
  useGetPropertyQuery,
} = api;
