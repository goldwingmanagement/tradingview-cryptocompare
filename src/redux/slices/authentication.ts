import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// utils
import axios from 'axios';
import { WritableDraft } from 'immer/dist/internal';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

export interface AuthenticationState {
  clientId: string | undefined;
  userId: string | undefined;
  token: string | null;
  error: Error | string | null;
}

// ----------------------------------------------------------------------

const initialState = {
    clientId: 'tradeshare.com',
    userId: 'public',
    token: null,
    error: null
} as AuthenticationState;

const slice = createSlice({
    name: 'authentication',
    initialState,
    reducers: {
    // SET JWT TOKEN
        setToken(state: WritableDraft<AuthenticationState>, action: PayloadAction<string>) {
            state.error = null;
            state.token = action.payload;
        },

        setUserId(state: WritableDraft<AuthenticationState>, action: PayloadAction<string>) {
            state.error = null;
            state.userId = action.payload;
        },

        // SET ERROR
        setError(state: WritableDraft<AuthenticationState>, action: PayloadAction<string>) {
            state.error = action.payload;
        }
    },
});

// Reducer
export default slice.reducer;

// Actions
export function login(username: string, password: string) {
    return async () => {
        try {
            const response = await axios.post('/users/login', {
                username,
                password
            });
            dispatch(slice.actions.setToken(response.data.token));
        } catch (err) {
            if (typeof err === 'string') {
                dispatch(slice.actions.setError(err));
            } else if (err instanceof Error) {
                dispatch(slice.actions.setError(err.message));
            }
        }
    };
}
