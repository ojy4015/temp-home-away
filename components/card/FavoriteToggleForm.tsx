'use client';

import { usePathname } from 'next/navigation';
import FormContainer from '../form/FormContainer';
import { toggleFavoriteAction } from '@/utils/actions';
import { CardSubmitButton } from '../form/Buttons';

type FavoriteToggleFormProps = {
  propertyId: string;
  favoriteId: string | null; //if favoriteId exist then this property is favorite, or  null : if property is not favorite
};

function FavoriteToggleForm({
  propertyId,
  favoriteId, // null or favorite
}: FavoriteToggleFormProps) {
  const pathname = usePathname(); // where we are at
  console.log('pathname :: ', pathname);

  // pass down  propertyId, favoriteId, pathname to the toggleFavoriteAction(serveraction) using bind
  const toggleAction = toggleFavoriteAction.bind(null, {
    propertyId,
    favoriteId,
    pathname,
  });
  return (
    <FormContainer action={toggleAction}>
      {/* favoriteId에 따라 icon 만 변경 */}
      <CardSubmitButton isFavorite={favoriteId ? true : false} />
    </FormContainer>
  );
}
export default FavoriteToggleForm;

// function FavoriteToggleForm() {
//   return <div>FavoriteToggleform</div>;
// }

// export default FavoriteToggleForm;
