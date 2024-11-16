import { fetchProperties } from '@/utils/actions';
import PropertiesList from './PropertiesList';
import EmptyList from './EmptyList';
import type { PropertyCardProps } from '@/utils/types';

async function PropertiesContainer({
  category,
  search,
}: {
  category?: string;
  search?: string;
}) {
  // console.log('category ===> ', category);
  // console.log('search ====? ', search);
  const properties: PropertyCardProps[] = await fetchProperties({
    category,
    search,
  });
  // console.log('properties -> ', properties);
  if (properties.length === 0) {
    return (
      <EmptyList
        heading="No results."
        message="Try changing or removing some of your filters."
        btnText="Clear Filters"
      />
    );
  }

  return <PropertiesList properties={properties} />;
}
export default PropertiesContainer;
