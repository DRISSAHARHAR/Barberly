import { createSlice } from '@reduxjs/toolkit';

const bookingSlice = createSlice({
  name: 'booking',
  initialState: { items: [] as any[] },
  reducers: {}
});

export default bookingSlice.reducer;
