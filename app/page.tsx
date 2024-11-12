import LoadingCards from '@/components/card/LoadingCards';

import CategoriesList from '@/components/home/CategoriesList';
import PropertiesContainer from '@/components/home/PropertiesContainer';
import { Suspense } from 'react';

function HomePage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string };
}) {
  // http://localhost:3000/?category=cabin&search=ttt
  // console.log('searchParams ---> ', searchParams); //searchParams --->  { category: 'cabin', search: 'ttt' }
  return (
    <section>
      <CategoriesList
        category={searchParams.category}
        search={searchParams.search}
      />
      <Suspense fallback={<LoadingCards />}>
        <PropertiesContainer
          category={searchParams.category}
          search={searchParams.search}
        />
      </Suspense>
    </section>
  );
}
export default HomePage;
