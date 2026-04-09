import { supabase } from '@/lib/supabaseClient'

export const uploadCardImage = async (file, userId) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${crypto.randomUUID()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('card-images')
    .upload(fileName, file)

  if (error) {
    throw error
  }

  return data.path
}