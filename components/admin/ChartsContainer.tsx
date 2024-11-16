import { fetchChartsData } from '@/utils/actions';
import Chart from './Chart';

async function ChartsContainer() {
  const bookings = await fetchChartsData();
  // console.log('bookings : ', bookings); // bookings :  [ { date: 'November 2024', count: 4 } ]

  if (bookings.length < 1) return null;
  return <Chart data={bookings} />;
}
export default ChartsContainer;
