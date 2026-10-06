import { createAsyncThunk } from '@reduxjs/toolkit';
import { baseApiFetch, getApiBaseUrl, getAuthToken } from '../api/baseApi';

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
  /**
   * Update current user profile
   * Step 1: POST /storage/upload (if avatar File is provided)
   * Step 2: PATCH /users/me (update profile fields and avatar URL)
   */
  updateMe: async (payload: UpdateMePayload): Promise<UserResponse> => {
    let uploadedAvatarUrl: string | undefined = undefined;

    // Step 1: Upload avatar File to POST /storage/upload if provided
    if (payload.avatar instanceof File) {
      const uploadFormData = new FormData();
      uploadFormData.append('file', payload.avatar);

      const API_BASE_URL = getApiBaseUrl();
      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const uploadRes = await fetch(`${API_BASE_URL}/storage/upload`, {
        method: 'POST',
        headers,
        body: uploadFormData,
        credentials: 'include',
      });

      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadJson.message || 'Failed to upload profile image to storage.');
      }

      uploadedAvatarUrl = uploadJson.url || uploadJson.data?.url || uploadJson.location;
    } else if (typeof payload.avatar === 'string') {
      uploadedAvatarUrl = payload.avatar;
    }

    // Step 2: Call PATCH /users/me with updated fields and avatar URL
    const body: Record<string, any> = {};
    if (payload.name !== undefined) body.name = payload.name;
    if (payload.contactNo !== undefined) body.contactNo = payload.contactNo;
    if (uploadedAvatarUrl) body.avatar = uploadedAvatarUrl;

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
