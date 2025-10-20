'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { unlockPremiumChapter } from './wallet-actions'

export async function unlockChapter(chapterId: string, coinCost: number) {
  const result = await unlockPremiumChapter(chapterId, coinCost)
  
  if (result.success) {
    revalidatePath('/read/[seriesId]/[chapterNumber]', 'page')
  }
  
  return result
}

export async function checkChapterUnlocked(chapterId: string, userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('chapter_unlocks')
    .select('id')
    .eq('user_id', userId)
    .eq('chapter_id', chapterId)
    .single()

  return { isUnlocked: !!data && !error }
}

