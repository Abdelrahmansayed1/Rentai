"use client";

import SettingsForm from "@/components/settings-form";
import { SettingsFormData } from "@/lib/schemas";
import { useGetAuthUserQuery, useUpdateTenantMutation } from "@/state/api";

const TenantSettings = () => {
  const { data: authUser, isLoading } = useGetAuthUserQuery();
  const [updateTenant] = useUpdateTenantMutation();

  const onSubmit = async (data: SettingsFormData) => {
    await updateTenant({
      cognitoId: authUser?.userInfo?.cognitoId,
      data,
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <SettingsForm
      initialData={{
        name: authUser?.userInfo?.name,
        email: authUser?.userInfo?.email,
        phoneNumber: authUser?.userInfo?.phoneNumber,
      }}
      onSubmit={onSubmit}
      userType="tenant"
    />
  );
};

export default TenantSettings;
