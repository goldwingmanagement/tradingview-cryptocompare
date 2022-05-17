import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// utils
// import axios from 'axios';
import { WritableDraft } from 'immer/dist/internal';
import { ThemeName } from '../../charting_library/charting_library';
//
// import { dispatch } from '../store';

// ----------------------------------------------------------------------

export interface PreferenceState {
  theme: ThemeName | undefined;
  error: Error | string | null;
}

// ----------------------------------------------------------------------

const initialState = {
    theme: 'Light',
    error: null
} as PreferenceState;

const slice = createSlice({
    name: 'preference',
    initialState,
    reducers: {
        setDarkMode(state: WritableDraft<PreferenceState>) {
            state.theme = 'Dark';
        },

        setLightMode(state: WritableDraft<PreferenceState>) {
            state.theme = 'Light';
        },

        // SET ERROR
        setError(state: WritableDraft<PreferenceState>, action: PayloadAction<string>) {
            state.error = action.payload;
        }
    },
});

// Reducer
export default slice.reducer;

export const { setDarkMode, setLightMode } = slice.actions;