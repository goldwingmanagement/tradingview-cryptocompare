import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// utils
// import axios from 'axios';
import { WritableDraft } from 'immer/dist/internal';
//
// import { dispatch } from '../store';

// ----------------------------------------------------------------------

interface ModalState {
  tradeModal: boolean;
  ordersModal: boolean;
  error: Error | string | null;
}

// ----------------------------------------------------------------------

const initialState = {
    tradeModal: false,
    ordersModal: false,
    error: null
} as ModalState;

const slice = createSlice({
    name: 'modal',
    initialState,
    reducers: {
        toggleTradeModal(state: WritableDraft<ModalState>, _action: PayloadAction<string>) {
            state.tradeModal = !state.tradeModal;
        },

        toggleOrdersModal(state: WritableDraft<ModalState>, _action: PayloadAction<string>) {
            state.ordersModal = !state.ordersModal;
        },

        // SET ERROR
        setError(state: WritableDraft<ModalState>, action: PayloadAction<string>) {
            state.error = action.payload;
        }
    },
});

// Reducer
export default slice.reducer;

export const { toggleTradeModal } = slice.actions;