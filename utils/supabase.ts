import { createClient } from '@supabase/supabase-js';

const bucket = 'eduexchange';

const url = process.env.SUPBASE_URL as string;
const key = process.env.SUPBASE_KEY as string;

const supabase = createClient(url, key);

export const uploadImage = async (image: File) => {
  console.log('image -----> ', image);
  // image9
  const timestamp = Date.now();
  const newName = `/users/${timestamp}-${image.name}`; //image9

  const { data } = await supabase.storage
    .from(bucket)
    .upload(newName, image, { cacheControl: '3600' }); //1 hour, image9

  if (!data) throw new Error('Image upload failed');
  return supabase.storage.from(bucket).getPublicUrl(newName).data.publicUrl;
};
