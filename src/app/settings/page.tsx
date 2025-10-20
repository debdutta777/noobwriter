'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Upload, Save, Loader2 } from 'lucide-react'
import { getCurrentUserProfile, updateUserProfile } from '@/app/actions/profile-actions'
import CoverUpload from '@/components/upload/CoverUpload'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    avatar_url: '',
    social_links: {
      twitter: '',
      facebook: '',
      instagram: '',
      website: ''
    }
  })

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { profile, error } = await getCurrentUserProfile()
      
      if (error || !profile) {
        setError('Failed to load profile')
        setLoading(false)
        return
      }

      setFormData({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
        social_links: profile.social_links || {
          twitter: '',
          facebook: '',
          instagram: '',
          website: ''
        }
      })
      setLoading(false)
    }

    loadProfile()
  }, [router])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    const result = await updateUserProfile(formData)

    if (result.success) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(result.error || 'Failed to update profile')
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your public profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Upload */}
                <div className="space-y-2">
                  <Label>Profile Picture</Label>
                  <div className="flex items-start gap-6">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted flex-shrink-0">
                      {formData.avatar_url ? (
                        <Image
                          src={formData.avatar_url}
                          alt="Avatar"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <CoverUpload
                        currentCoverUrl={formData.avatar_url}
                        onUploadComplete={(url) => setFormData({ ...formData, avatar_url: url })}
                        aspectRatio="square"
                      />
                    </div>
                  </div>
                </div>

                {/* Display Name */}
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    placeholder="Your display name"
                    maxLength={50}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.display_name.length}/50 characters
                  </p>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    className="min-h-[120px] resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.bio.length}/500 characters
                  </p>
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                  <Label>Social Links</Label>
                  
                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="text-sm font-normal">Twitter</Label>
                    <Input
                      id="twitter"
                      value={formData.social_links.twitter}
                      onChange={(e) => setFormData({
                        ...formData,
                        social_links: { ...formData.social_links, twitter: e.target.value }
                      })}
                      placeholder="https://twitter.com/username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="facebook" className="text-sm font-normal">Facebook</Label>
                    <Input
                      id="facebook"
                      value={formData.social_links.facebook}
                      onChange={(e) => setFormData({
                        ...formData,
                        social_links: { ...formData.social_links, facebook: e.target.value }
                      })}
                      placeholder="https://facebook.com/username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="text-sm font-normal">Instagram</Label>
                    <Input
                      id="instagram"
                      value={formData.social_links.instagram}
                      onChange={(e) => setFormData({
                        ...formData,
                        social_links: { ...formData.social_links, instagram: e.target.value }
                      })}
                      placeholder="https://instagram.com/username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-sm font-normal">Website</Label>
                    <Input
                      id="website"
                      value={formData.social_links.website}
                      onChange={(e) => setFormData({
                        ...formData,
                        social_links: { ...formData.social_links, website: e.target.value }
                      })}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center gap-4 pt-4">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>

                  {success && (
                    <p className="text-green-600 text-sm">Profile updated successfully!</p>
                  )}
                  {error && (
                    <p className="text-destructive text-sm">{error}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account security and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Account settings coming soon</p>
                  <p className="text-sm mt-2">Email, password, and security settings</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Reading Preferences</CardTitle>
                <CardDescription>
                  Customize your reading experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Preferences coming soon</p>
                  <p className="text-sm mt-2">Theme, font size, and notification settings</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
