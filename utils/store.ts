import { create } from 'zustand';
import { Booking } from './types';
import { DateRange } from 'react-day-picker'; // calendar uses this type
// Define the state's shape
type PropertyState = {
  propertyId: string;
  price: number;
  bookings: Booking[];
  range: DateRange | undefined;
};

// Create the store
export const useProperty = create<PropertyState>(() => {
  // default state
  return {
    propertyId: '',
    price: 0,
    bookings: [],
    range: undefined,
  };
});
