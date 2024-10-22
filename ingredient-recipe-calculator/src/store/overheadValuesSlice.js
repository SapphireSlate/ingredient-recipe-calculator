import { createSlice } from '@reduxjs/toolkit';

const overheadSlice = createSlice({
  name: 'overheadValues',
  initialState: {
    overhead: {
      rent: 0,
      utilities: 0,
      wages: 0,
      otherExpenses: 0,
    },
    avgProductionVolume: 0,
    avgBatches: 0,
    productionUnit: 'items',
    targetProfitMargin: 0.2,
    overheadPerUnit: 0,
  },
  reducers: {
    setOverheadValues: (state, action) => {
      return { ...state, ...action.payload };
    },
    calculateOverheadPerUnit: (state) => {
      const totalOverhead = Object.values(state.overhead).reduce((sum, value) => sum + value, 0);
      state.overheadPerUnit = totalOverhead / (state.productionUnit === 'items' ? state.avgProductionVolume : state.avgBatches);
    },
  },
});

export const { setOverheadValues, calculateOverheadPerUnit } = overheadSlice.actions;

export default overheadSlice.reducer;