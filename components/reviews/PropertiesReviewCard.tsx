/* eslint-disable react/jsx-no-undef */
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Rating from './Rating';
import Comment from './Comment';
import Image from 'next/image';
type ReviewCardProps = {
  reviewInfo: {
    comment: string;
    rating: number;
    name: string; // property name
    image: string; // property image
  };
  children?: React.ReactNode;
};

function PropertiesReviewCard({ reviewInfo, children }: ReviewCardProps) {
  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-center">
          <Image
            src={reviewInfo.image} // property image
            alt={reviewInfo.name} // proeperty name
            width={12}
            height={12}
            className="w-12 h-12 rounded-full object-cover"
          />

          <div className="ml-4">
            <h3 className="text-sm font-bold capitalize mb-1">
              {reviewInfo.name}
            </h3>
            <Rating rating={reviewInfo.rating} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Comment comment={reviewInfo.comment} />
      </CardContent>
      {/* delete button later */}
      {/* children = <DeleteReview reviewId={review.id} /> */}
      <div className="absolute top-3 right-3">{children}</div>
    </Card>
  );
}
export default PropertiesReviewCard;
