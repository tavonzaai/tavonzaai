import { createAsyncThunk } from '@reduxjs/toolkit';
import { baseApiFetch, getApiBaseUrl } from '../api/baseApi';

export interface UpdateMePayload {
  name?: string;
  contactNo?: string;
  avatar?: string | File;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  contactNo?: string;
  role: string;
  status: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export const rawUserApi = {
  updateMe: async (payload: UpdateMePayload): Promise<UserResponse> => {
    if (payload.avatar instanceof File) {
      const formData = new FormData();
      formData.append('avatar', payload.avatar);
      const dataPayload: Record<string, any> = {};
      if (payload.name !== undefined) dataPayload.name = payload.name;
      if (payload.contactNo !== undefined) dataPayload.contactNo = payload.contactNo;
      formData.append('data', JSON.stringify(dataPayload));

      const API_BASE_URL = getApiBaseUrl();
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PATCH',
        body: formData,
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to update profile');
      }
      return json.data;
    }

    const body: Record<string, any> = {};
    if (payload.name !== undefined) body.name = payload.name;
    if (payload.contactNo !== undefined) body.contactNo = payload.contactNo;

    const response = await baseApiFetch<UserResponse>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return response.data || (response as any);
  },
};

export const updateMe = createAsyncThunk(
  'user/updateMe',
  async (payload: UpdateMePayload, { rejectWithValue }) => {
    try {
      return await rawUserApi.updateMe(payload);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update profile.');
    }
  }
);
