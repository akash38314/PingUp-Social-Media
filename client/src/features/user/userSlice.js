import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios.js'

const initialState = {
    value: {
        _id: "user_123",
        full_name: "John Warren",
        username: "john_warren",
        profile_picture: "https://randomuser.me/api/portraits/men/1.jpg",
        bio: "Dreamer | Learner | Doer",
        cover_photo: null,
        followers: [],
        following: [],
        connections: []
    }
}

export const fetchUser = createAsyncThunk('user/fetchUser', async (token) => {
    try {
        const { data } = await api.get('/api/user/data', {
            headers: { Authorization: `Bearer ${token}` }
        })
        return data.success ? data.user : initialState.value
    } catch (error) {
        console.log("API error, using dummy data")
        return initialState.value
    }
})

export const updateUser = createAsyncThunk('user/update', async ({ userData, token }) => {
    const { data } = await api.post('/api/user/update', userData, {
        headers: { Authorization: `Bearer ${token}` }
    })
    return data.success ? data.user : null
})

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUser.fulfilled, (state, action) => {
                if (action.payload) {
                    state.value = action.payload
                }
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                if (action.payload) state.value = action.payload
            })
    }
})

export default userSlice.reducer