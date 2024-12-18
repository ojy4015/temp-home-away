import { auth } from '@clerk/nextjs/server';
import { CardSignInButton } from '../form/Buttons';
import { fetchPropertiesFavoriteId } from '@/utils/actions';
import FavoriteToggleForm from './FavoriteToggleForm';
async function FavoriteToggleButton({ propertyId }: { propertyId: string }) {
  const { userId } = auth();
  // 로그인 안할시 표시할 아이콘(문구)만 선택함
  if (!userId) return <CardSignInButton />;
  // propertiesfavoriteId가 존재하면 favorite or null 이면 not favorite
  const propertiesfavoriteId = await fetchPropertiesFavoriteId({ propertyId });
  return (
    <FavoriteToggleForm
      favoriteId={propertiesfavoriteId}
      propertyId={propertyId}
    />
  );
}
export default FavoriteToggleButton;
