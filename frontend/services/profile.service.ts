import api from "./api";
import type { AuthUser } from "./auth.service";

export async function getProfile(): Promise<AuthUser> {
  const { data } = await api.get("/profile");
  return data.data.user;
}

export async function updateProfile(name: string): Promise<AuthUser> {
  const { data } = await api.patch("/profile", { name });
  return data.data.user;
}

export async function uploadAvatar(file: File): Promise<AuthUser> {
  const form = new FormData();
  form.append("avatar", file);
  const { data } = await api.post("/profile/avatar", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data.user;
}

export async function deleteAccount(): Promise<void> {
  await api.delete("/profile");
}
