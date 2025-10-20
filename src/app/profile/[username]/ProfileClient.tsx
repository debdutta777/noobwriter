'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  User,
  BookOpen,
  Heart,
  Users,
  UserPlus,
  UserMinus,
  Settings,
  Calendar,
  Eye,
  FileText,
  Twitter,
  Facebook,
  Instagram,
  Globe
} from 'lucide-react'
import type { UserProfile } from '@/app/actions/profile-actions'
import { followUser, unfollowUser, checkIfFollowing } from '@/app/actions/profile-actions'
import { useEffect } from 'react'

interface ProfileClientProps {
  profile: UserProfile
}

export default function ProfileClient({ profile }: ProfileClientProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCurrentUser, setIsCurrentUser] = useState(false)

  useEffect(() => {
    async function checkFollow() {
      const { isFollowing: following } = await checkIfFollowing(profile.id)
      setIsFollowing(following)
    }
    checkFollow()
  }, [profile.id])

  const handleFollowToggle = async () => {
    setIsLoading(true)
    if (isFollowing) {
      await unfollowUser(profile.id)
      setIsFollowing(false)
    } else {
      await followUser(profile.id)
      setIsFollowing(true)
    }
    setIsLoading(false)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-muted flex-shrink-0 border-4 border-background shadow-xl">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  <User className="w-16 h-16 text-primary" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-1">{profile.display_name}</h1>
                  <p className="text-muted-foreground">@{profile.username}</p>
                </div>
                
                <div className="flex gap-2">
                  {isCurrentUser ? (
                    <Button asChild>
                      <Link href="/settings">
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      onClick={handleFollowToggle}
                      disabled={isLoading}
                      variant={isFollowing ? 'outline' : 'default'}
                    >
                      {isFollowing ? (
                        <>
                          <UserMinus className="w-4 h-4 mr-2" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-muted-foreground mb-4 max-w-2xl">{profile.bio}</p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">{profile.stats.stories_written}</span>
                  <span className="text-muted-foreground text-sm">Stories</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">{profile.stats.chapters_published}</span>
                  <span className="text-muted-foreground text-sm">Chapters</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">{profile.stats.total_reads.toLocaleString()}</span>
                  <span className="text-muted-foreground text-sm">Views</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">{profile.stats.followers}</span>
                  <span className="text-muted-foreground text-sm">Followers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">{profile.stats.following}</span>
                  <span className="text-muted-foreground text-sm">Following</span>
                </div>
              </div>

              {/* Social Links */}
              {profile.social_links && Object.keys(profile.social_links).length > 0 && (
                <div className="flex gap-3">
                  {profile.social_links.twitter && (
                    <a
                      href={profile.social_links.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {profile.social_links.facebook && (
                    <a
                      href={profile.social_links.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                  {profile.social_links.instagram && (
                    <a
                      href={profile.social_links.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {profile.social_links.website && (
                    <a
                      href={profile.social_links.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}

              {/* Member Since */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                <Calendar className="w-4 h-4" />
                <span>Member since {formatDate(profile.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="stories" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="stories">Stories</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="stories">
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Stories will be displayed here</p>
              <p className="text-sm mt-2">Feature coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="favorites">
            <div className="text-center py-12 text-muted-foreground">
              <Heart className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Favorite stories will be displayed here</p>
              <p className="text-sm mt-2">Feature coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Recent activity will be displayed here</p>
              <p className="text-sm mt-2">Feature coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
