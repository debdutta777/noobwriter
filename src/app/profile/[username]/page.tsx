import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProfileClient from './ProfileClient'
import { getUserProfile } from '@/app/actions/profile-actions'

export const metadata: Metadata = {
  title: 'User Profile',
  description: 'View user profile and published works',
}

interface PageProps {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params
  const { profile, error } = await getUserProfile(username)

  if (error || !profile) {
    notFound()
  }

  return <ProfileClient profile={profile} />
}
