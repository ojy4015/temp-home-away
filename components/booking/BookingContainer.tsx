'use client';

import { useProperty } from '@/utils/store';
import ConfirmBooking from './ConfirmBooking';
import BookingForm from './BookingForm';
function BookingContainer() {
  // const state = useProperty((state) => state);
  // console.log('state : ', state);

  // how the state values are changing
  const { range } = useProperty((state) => state);

  if (!range || !range.from || !range.to) return null;
  if (range.to.getTime() === range.from.getTime()) return null;
  return (
    <div className="w-full">
      <BookingForm />
      <ConfirmBooking />
    </div>
  );
}

export default BookingContainer;
