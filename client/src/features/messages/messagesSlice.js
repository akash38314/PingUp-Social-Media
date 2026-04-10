import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios.js'

const initialState = { messages: [] }

export const fetchMessages = createAsyncThunk('messages/fetchMessages', async ({ token, userId }) => {
    try {
        const { data } = await api.post('/api/message/get', { to_user_id: userId }, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return data.success ? data : null
    } catch (error) {
        console.log("API error")
        return null
    }
})

const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        addMessage: (state, action) => {
            state.messages = [...state.messages, action.payload]
        },
        resetMessages: (state) => {
            state.messages = []
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchMessages.fulfilled, (state, action) => {
            if (action.payload) {
                state.messages = action.payload.messages || []
            }
        })
    }
})

export const { addMessage, resetMessages } = messagesSlice.actions
export default messagesSlice.reducer