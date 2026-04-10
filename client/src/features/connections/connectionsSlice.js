import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios.js'

const initialState = {
    connections: [
        {
            _id: "user_456",
            full_name: "Richard Hendricks",
            username: "richard",
            profile_picture: "https://randomuser.me/api/portraits/men/2.jpg",
            bio: "CEO of Pied Piper"
        }
    ],
    pendingConnections: [],
    followers: [],
    following: []
}

export const fetchConnections = createAsyncThunk('connections/fetchConnections', async (token) => {
    try {
        const { data } = await api.get('/api/user/connections', {
            headers: { Authorization: `Bearer ${token}` }
        })
        return data.success ? data : initialState
    } catch (error) {
        console.log("API error, using dummy data")
        return initialState
    }
})

const connectionsSlice = createSlice({
    name: 'connections',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchConnections.fulfilled, (state, action) => {
            if (action.payload) {
                state.connections = action.payload.connections || []
                state.pendingConnections = action.payload.pendingConnections || []
                state.followers = action.payload.followers || []
                state.following = action.payload.following || []
            }
        })
    }
})

export default connectionsSlice.reducer