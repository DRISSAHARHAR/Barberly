import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notification',
  initialState: { items: [] as any[] },
  reducers: {}
});

export default notificationSlice.reducer;
