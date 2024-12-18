'use server';

import {
  createPropertiesReviewSchema,
  imageSchema,
  profileSchema,
  propertiesReviewSchema,
  propertySchema,
  validateWithZodSchema,
} from './schemas';
import db from './db';
import { auth, clerkClient, currentUser } from '@clerk/nextjs/server'; // auth return clerkId
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { uploadImage } from './supabase';
import { calculateTotals } from './calculateTotals';
import { formatDate } from './format';

// get entire user including metadata(hasProfile)
const getAuthUser = async () => {
  const user = await currentUser();
  if (!user) {
    throw new Error('You must be logged in to access this route');
  }
  if (!user.privateMetadata.hasProfile) redirect('/profile/create');
  return user;
};

const getAdminUser = async () => {
  const user = await getAuthUser();
  if (user.id !== process.env.ADMIN_USER_ID) redirect('/');
  return user;
};

const renderError = (error: unknown): { message: string } => {
  console.log(error);
  return {
    message: error instanceof Error ? error.message : 'An error occurred',
  };
};

export const createProfileAction = async (
  prevState: any,
  formData: FormData
) => {
  try {
    const user = await currentUser();
    // console.log(user);
    if (!user) throw new Error('Please login to create a profile');

    const rawData = Object.fromEntries(formData);

    // const validatedFields = profileSchema.parse(rawData);
    const validatedFields = validateWithZodSchema(profileSchema, rawData);

    // console.log(validatedFields);
    await db.profile.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        profileImage: user.imageUrl ?? '',
        ...validatedFields,
      },
    });
    await clerkClient.users.updateUserMetadata(user.id, {
      privateMetadata: {
        hasProfile: true,
      },
    });
    // return { message: 'profile created' };
  } catch (error) {
    return renderError(error);
  }
  redirect('/');
};

// get only profileImage
export const fetchProfileImage = async () => {
  const user = await currentUser();
  if (!user) return null;

  const profile = await db.profile.findUnique({
    where: {
      clerkId: user.id,
    },
    select: {
      profileImage: true,
    },
  });

  return profile?.profileImage;
};

// get every profile info
export const fetchProfile = async () => {
  const user = await getAuthUser();
  const profile = await db.profile.findUnique({
    where: {
      clerkId: user.id,
    },
  });
  if (!profile) redirect('/profile/create');
  return profile;
};

export const updateProfileAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();

  try {
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(profileSchema, rawData);

    // const validatedFields = profileSchema.safeParse(rawData);
    // console.log('validatedFields.error -----> ', validatedFields.error);

    // if (!validatedFields.success) {
    //   const errors = validatedFields.error.errors.map((error) => error.message);
    //   throw new Error(errors.join(','));
    // }

    await db.profile.update({
      where: {
        clerkId: user.id,
      },
      data: validatedFields,
    });

    revalidatePath('/profile');
    return { message: 'Profile updated successfully' };
  } catch (error) {
    return renderError(error);
  }
};

export const updateProfileImageAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  try {
    const image = formData.get('image') as File;
    const validatedFields = validateWithZodSchema(imageSchema, { image });
    // console.log('validatedFields ====> ', validatedFields);
    const fullPath = await uploadImage(validatedFields.image);

    await db.profile.update({
      where: {
        clerkId: user.id,
      },
      data: {
        profileImage: fullPath,
      },
    });
    revalidatePath('/profile');
    return { message: 'Profile image updated successfully' };
  } catch (error) {
    return renderError(error);
  }
};

export const createPropertyAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  try {
    const rawData = Object.fromEntries(formData);
    // console.log('rawData -> ', rawData);
    const file = formData.get('image') as File; // image5
    // console.log('file => ', file);
    const validatedFields = validateWithZodSchema(propertySchema, rawData);
    const validatedFile = validateWithZodSchema(imageSchema, { image: file }); //image8
    // upload image to the supabase
    const fullPath = await uploadImage(validatedFile.image); //image8
    // console.log('fullPath => ', fullPath);
    await db.property.create({
      data: {
        ...validatedFields,
        image: fullPath,
        profileId: user.id,
      },
    });
    // return { message: 'property created' };
  } catch (error) {
    return renderError(error);
  }
  redirect('/');
};

export const fetchProperties = async ({
  search = '',
  category,
}: {
  search?: string;
  category?: string;
}) => {
  const properties = await db.property.findMany({
    // filter funtion
    // https://nextjs-home-away-production.vercel.app/?category=cabin&search=fff
    where: {
      category,
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { tagline: { contains: search, mode: 'insensitive' } },
      ],
    },
    // display in the card also in my type(types.ts)
    select: {
      id: true,
      name: true,
      tagline: true,
      country: true,
      price: true,
      image: true,
    },
    orderBy: {
      createdAt: 'desc', // newest goes to first
    },
  });
  return properties;
};

// favorite.id를 가져온다
export const fetchPropertiesFavoriteId = async ({
  propertyId,
}: {
  propertyId: string;
}) => {
  const user = await getAuthUser();
  const favorite = await db.propertiesFavorite.findFirst({
    where: {
      propertyId,
      profileId: user.id,
    },
    select: {
      id: true,
    },
  });
  return favorite?.id || null;
};

//prevState: 초기 인자로 form의 이전 state를 받는다
export const toggleFavoriteAction = async (prevState: {
  propertyId: string;
  favoriteId: string | null;
  pathname: string;
}) => {
  const user = await getAuthUser();
  const { propertyId, favoriteId, pathname } = prevState;
  // console.log(
  //   'propertyId, favoriteId, pathname :: ',
  //   propertyId,
  //   favoriteId,
  //   pathname
  // );
  try {
    if (favoriteId) {
      await db.propertiesFavorite.delete({
        where: {
          id: favoriteId,
        },
      });
    } else {
      await db.propertiesFavorite.create({
        data: {
          propertyId,
          profileId: user.id,
        },
      });
    }
    revalidatePath(pathname);
    return { message: favoriteId ? 'Removed from Faves' : 'Added to Faves' };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchFavorites = async () => {
  const user = await getAuthUser();
  // favorites is an array
  const favorites = await db.propertiesFavorite.findMany({
    where: {
      profileId: user.id,
    },
    select: {
      property: {
        select: {
          id: true,
          name: true,
          tagline: true,
          country: true,
          price: true,
          image: true,
        },
      },
    },
  });
  return favorites.map((favorite) => favorite.property);
};

// return null if something wrong with id
export const fetchPropertyDetails = (id: string) => {
  return db.property.findUnique({
    where: {
      id,
    },
    include: {
      profile: true, // all of properties from the profile
      bookings: {
        select: {
          checkIn: true,
          checkOut: true,
        },
      },
    },
  });
};

export async function createPropertiesReviewAction(
  prevState: any,
  formData: FormData
) {
  const user = await getAuthUser();
  try {
    const rawData = Object.fromEntries(formData);
    // console.log('rawData 666 : ', rawData);

    const validatedFields = validateWithZodSchema(
      createPropertiesReviewSchema,
      rawData
    );

    await db.propertiesReview.create({
      data: {
        ...validatedFields,
        profileId: user.id,
      },
    });
    revalidatePath(`/properties/${validatedFields.propertyId}`);
    return { message: 'Review submitted successfully' };
  } catch (error) {
    return renderError(error);
  }
  // return { message: 'createReviewAction' };
}

export async function fetchPropertyReviews(propertyId: string) {
  const reviews = await db.propertiesReview.findMany({
    where: {
      propertyId,
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      profile: {
        select: {
          firstName: true,
          profileImage: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return reviews;
}

export const fetchPropertyReviewsByUser = async () => {
  const user = await getAuthUser();
  const reviews = await db.propertiesReview.findMany({
    where: {
      profileId: user.id, // 현재 로그인한 사람
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      property: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });
  return reviews;
};

export const deletePropertyReviewAction = async (prevState: {
  reviewId: string;
}) => {
  const { reviewId } = prevState;
  const user = await getAuthUser();

  try {
    await db.propertiesReview.delete({
      // 이 제품의 reviews 중 로그인한 사람의 리뷰만 지움
      where: {
        id: reviewId,
        profileId: user.id,
      },
    });

    revalidatePath('/reviews');
    return { message: 'Review deleted successfully' };
  } catch (error) {
    return renderError(error);
  }
};

// whether user has already left the review: null => doesn't leave a review yet
export const findExistingPropertyReview = async (
  userId: string,
  propertyId: string
) => {
  return db.propertiesReview.findFirst({
    where: {
      profileId: userId,
      propertyId: propertyId,
    },
  });
};

// get me the rating avg and count for specific property
export async function fetchPropertyRating(propertyId: string) {
  const result = await db.propertiesReview.groupBy({
    by: ['propertyId'],
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
    where: {
      propertyId,
    },
  });

  // empty array if no reviews
  return {
    rating: result[0]?._avg.rating?.toFixed(1) ?? 0,
    count: result[0]?._count.rating ?? 0,
  };
}

export const createBookingAction = async (prevState: {
  propertyId: string;
  checkIn: Date;
  checkOut: Date;
}) => {
  const user = await getAuthUser();
  // await db.booking.deleteMany({
  //   where: {
  //     profileId: user.id,
  //     paymentStatus: false,
  //   },
  // });
  // let bookingId: null | string = null;

  // 프로트엔드를 신뢰하지 않기 때문에 price를 가져오지 않음
  const { propertyId, checkIn, checkOut } = prevState;
  const property = await db.property.findUnique({
    where: { id: propertyId },
    select: { price: true },
  });
  if (!property) {
    return { message: 'Property not found' };
  }
  const { orderTotal, totalNights } = calculateTotals({
    checkIn,
    checkOut,
    price: property.price,
  });

  try {
    const booking = await db.booking.create({
      data: {
        checkIn,
        checkOut,
        orderTotal,
        totalNights,
        profileId: user.id,
        propertyId,
      },
    });
    // bookingId = booking.id;
  } catch (error) {
    return renderError(error);
  }
  // redirect(`/checkout?bookingId=${bookingId}`);
  redirect(`/bookings`);
};

export const fetchBookings = async () => {
  const user = await getAuthUser();
  const bookings = await db.booking.findMany({
    where: {
      profileId: user.id,
      // paymentStatus: true,
    },
    include: {
      property: {
        select: {
          id: true, // link that navigates back to property
          name: true,
          country: true,
        },
      },
    },

    orderBy: {
      checkIn: 'desc',
    },
  });
  return bookings;
};

export async function deleteBookingAction(prevState: { bookingId: string }) {
  const { bookingId } = prevState;
  const user = await getAuthUser();

  try {
    const result = await db.booking.delete({
      where: {
        id: bookingId,
        profileId: user.id,
      },
    });

    revalidatePath('/bookings');
    return { message: 'Booking deleted successfully' };
  } catch (error) {
    return renderError(error);
  }
}

// grab all the properties where the profileId is equal to user.id
export const fetchRentals = async () => {
  const user = await getAuthUser();
  const rentals = await db.property.findMany({
    where: {
      profileId: user.id,
    },
    select: {
      id: true,
      name: true,
      price: true,
    },
  });

  // iterate over rentals array, want to get the booking info(totalNights, orderTotal) for every rental,
  const rentalsWithBookingSums = await Promise.all(
    rentals.map(async (rental) => {
      const totalNightsSum = await db.booking.aggregate({
        where: {
          propertyId: rental.id,
          // paymentStatus: true,
        },
        _sum: {
          totalNights: true,
        },
      });

      const orderTotalSum = await db.booking.aggregate({
        where: {
          propertyId: rental.id,
          // paymentStatus: true,
        },
        _sum: {
          orderTotal: true,
        },
      });

      return {
        ...rental,
        totalNightsSum: totalNightsSum._sum.totalNights,
        orderTotalSum: orderTotalSum._sum.orderTotal,
      };
    })
  );

  // {property의 id, name, price, booking의 totalNightsSum, orderTotalSum }
  return rentalsWithBookingSums;
};

// owner of the property to have this ability
export async function deleteRentalAction(prevState: { propertyId: string }) {
  const { propertyId } = prevState;
  const user = await getAuthUser();

  try {
    await db.property.delete({
      where: {
        id: propertyId,
        profileId: user.id,
      },
    });

    revalidatePath('/rentals');
    return { message: 'Rental deleted successfully' };
  } catch (error) {
    return renderError(error);
  }
}

// get all of current property values of logged in user
export const fetchRentalDetails = async (propertyId: string) => {
  const user = await getAuthUser();

  return db.property.findUnique({
    where: {
      id: propertyId,
      profileId: user.id,
    },
  });
};

export const updatePropertyAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  const propertyId = formData.get('id') as string;

  try {
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(propertySchema, rawData);
    await db.property.update({
      where: {
        id: propertyId,
        profileId: user.id,
      },
      data: {
        ...validatedFields,
      },
    });

    revalidatePath(`/rentals/${propertyId}/edit`);
    return { message: 'Update Successful' };
  } catch (error) {
    return renderError(error);
  }
};

export const updatePropertyImageAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  const propertyId = formData.get('id') as string;

  try {
    const image = formData.get('image') as File;
    // console.log('image ---> ', image);
    const validatedFields = validateWithZodSchema(imageSchema, { image });
    const fullPath = await uploadImage(validatedFields.image);

    await db.property.update({
      where: {
        id: propertyId,
        profileId: user.id,
      },
      data: {
        image: fullPath,
      },
    });
    revalidatePath(`/rentals/${propertyId}/edit`);
    return { message: 'Property Image Updated Successful' };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchReservations = async () => {
  const user = await getAuthUser();

  // console.log('user 555 ', user.id);

  const reservations = await db.booking.findMany({
    where: {
      // paymentStatus: true,
      property: {
        profileId: user.id,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      property: {
        select: {
          id: true,
          name: true,
          price: true,
          country: true,
        },
      },
    },
  });
  return reservations;
};

export const fetchStats = async () => {
  await getAdminUser();

  const usersCount = await db.profile.count();
  const propertiesCount = await db.property.count();
  const bookingsCount = await db.booking.count();
  // const bookingsCount = await db.booking.count({
  //   where: {
  //     paymentStatus: true,
  //   },
  // });

  return {
    usersCount,
    propertiesCount,
    bookingsCount,
  };
};

export const fetchChartsData = async () => {
  await getAdminUser();
  const date = new Date();

  // display last 6month
  date.setMonth(date.getMonth() - 6);
  // 지금으로 부터 6개월 전
  const sixMonthsAgo = date;

  // 6개월전부터 지금까지 모든booking array
  const bookings = await db.booking.findMany({
    where: {
      // paymentStatus: true,
      createdAt: {
        gte: sixMonthsAgo,
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
  // console.log('bookings : ', bookings);

  // how many bookings have been made in that specific month
  const bookingsPerMonth = bookings.reduce((total, current) => {
    // group bookings array by month, date has only year and month
    const date = formatDate(current.createdAt, true);
    // console.log('date : ', date);
    const existingEntry = total.find((entry) => entry.date === date);
    // console.log('existingEntry : ', existingEntry);
    if (existingEntry) {
      existingEntry.count += 1;
    } else {
      total.push({ date, count: 1 });
    }
    // console.log('total : ', total);
    return total;
  }, [] as Array<{ date: string; count: number }>);
  return bookingsPerMonth; // return array of date and count
};

export const fetchReservationStats = async () => {
  const user = await getAuthUser();

  const properties = await db.property.count({
    where: {
      profileId: user.id,
    },
  });

  const totals = await db.booking.aggregate({
    _sum: {
      orderTotal: true,
      totalNights: true,
    },
    where: {
      property: {
        profileId: user.id,
      },
    },
  });

  return {
    properties,
    nights: totals._sum.totalNights || 0,
    amount: totals._sum.orderTotal || 0,
  };
};
