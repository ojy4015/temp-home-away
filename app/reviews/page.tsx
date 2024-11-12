import EmptyList from '@/components/home/EmptyList';
import {
  deletePropertyReviewAction,
  fetchPropertyReviewsByUser,
} from '@/utils/actions';
import Title from '@/components/properties/Title';
import FormContainer from '@/components/form/FormContainer';
import { IconButton } from '@/components/form/Buttons';
import PropertiesReviewCard from '@/components/reviews/PropertiesReviewCard';

async function ReviewsPage() {
  // 현재 로그인한 사람의 review전체를 가져옴
  const reviews = await fetchPropertyReviewsByUser();
  if (reviews.length === 0) return <EmptyList />;

  return (
    <>
      <Title text="Your Reviews" />
      <section className="grid md:grid-cols-2 gap-8 mt-4 ">
        {reviews.map((review) => {
          const { comment, rating } = review;
          const { name, image } = review.property;
          const reviewInfo = {
            comment,
            rating,
            name, // property name
            image, // property image
          };
          return (
            <PropertiesReviewCard key={review.id} reviewInfo={reviewInfo}>
              <DeleteReview reviewId={review.id} />
            </PropertiesReviewCard>
          );
        })}
      </section>
    </>
  );
}

// display delete button which in turn is going to remove thar review
const DeleteReview = ({ reviewId }: { reviewId: string }) => {
  // reviewId를 deletePropertyReviewAction에 전달
  const deleteReview = deletePropertyReviewAction.bind(null, { reviewId });
  return (
    <FormContainer action={deleteReview}>
      {/* action type이 edit or delete에 따라 반환되는 icon이 다름 */}
      <IconButton actionType="delete" />
    </FormContainer>
  );
};

export default ReviewsPage;
