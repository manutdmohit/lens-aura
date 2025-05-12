"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Save, User, Lock, Bell, Globe, CreditCard, Mail, ShieldCheck, Palette } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AdminLayout from "@/components/admin/admin-layout"
import ProtectedRoute from "@/components/admin/protected-route"
import { toast } from 'sonner'

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<Record<string, any> | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const currentPasswordRef = useRef<HTMLInputElement>(null)
  const newPasswordRef = useRef<HTMLInputElement>(null)
  const confirmPasswordRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (!response.ok) {
          throw new Error('Failed to fetch settings')
        }
        const data = await response.json()
        setSettings(data || {})
      } catch (error) {
        console.error('Error fetching settings:', error)
        setSettings({})
      }
    }
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setPasswordError(null)
    setPasswordSuccess(null)
    const settingsData = {
      storeName: (document.getElementById('store-name') as HTMLInputElement)?.value,
      storeUrl: (document.getElementById('store-url') as HTMLInputElement)?.value,
      storeDescription: (document.getElementById('store-description') as HTMLTextAreaElement)?.value,
      currency: (document.getElementById('currency') as HTMLSelectElement)?.value,
      timezone: (document.getElementById('timezone') as HTMLSelectElement)?.value,
      name: (document.getElementById('name') as HTMLInputElement)?.value,
      email: (document.getElementById('email') as HTMLInputElement)?.value,
      phone: (document.getElementById('phone') as HTMLInputElement)?.value,
      bio: (document.getElementById('bio') as HTMLTextAreaElement)?.value,
    }

    const currentPassword = currentPasswordRef.current?.value || ''
    const newPassword = newPasswordRef.current?.value || ''
    const confirmPassword = confirmPasswordRef.current?.value || ''

    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        setPasswordError('All password fields are required.')
        setSaving(false)
        return
      }
      if (newPassword !== confirmPassword) {
        setPasswordError('New passwords do not match.')
        setSaving(false)
        return
      }
      if (newPassword.length < 8) {
        setPasswordError('New password must be at least 8 characters.')
        setSaving(false)
        return
      }
      try {
        const response = await fetch('/api/settings', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        })
        if (!response.ok) {
          const errorData = await response.json()
          setPasswordError(errorData.error || 'Failed to update password.')
          setSaving(false)
          return
        }
        setPasswordSuccess('Password updated successfully!')
        if (currentPasswordRef.current) currentPasswordRef.current.value = ''
        if (newPasswordRef.current) newPasswordRef.current.value = ''
        if (confirmPasswordRef.current) confirmPasswordRef.current.value = ''
      } catch (error) {
        setPasswordError('Failed to update password.')
        setSaving(false)
        return
      }
    }

    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to save settings: ${errorData.error}`)
      }

      const updatedSettings = await response.json()
      setSettings(updatedSettings.settings)
      toast.success('Settings saved successfully!')
      window.location.reload()
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ProtectedRoute resource="settings" action="read">
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-gray-500">Manage your store settings and preferences</p>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 w-full">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden md:inline">General</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden md:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span className="hidden md:inline">Update Password</span>
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Manage your store's general settings and information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="store-name">Store Name</Label>
                      <Input id="store-name" defaultValue={settings?.storeName || ''} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="store-url">Store URL</Label>
                      <Input id="store-url" defaultValue={settings?.storeUrl || ''} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="store-description">Store Description</Label>
                      <Textarea
                        id="store-description"
                        defaultValue={settings?.storeDescription || ''}
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select defaultValue={settings?.currency || 'aud'}>
                        <SelectTrigger id="currency">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aud">Australian Dollar (AUD)</SelectItem>
                          <SelectItem value="usd">US Dollar (USD)</SelectItem>
                          <SelectItem value="eur">Euro (EUR)</SelectItem>
                          <SelectItem value="gbp">British Pound (GBP)</SelectItem>
                          <SelectItem value="cad">Canadian Dollar (CAD)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select defaultValue={settings?.timezone || 'australia/sydney'}>
                        <SelectTrigger id="timezone">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="australia/sydney">Australia/Sydney</SelectItem>
                          <SelectItem value="america/new_york">America/New York</SelectItem>
                          <SelectItem value="europe/london">Europe/London</SelectItem>
                          <SelectItem value="asia/tokyo">Asia/Tokyo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? (
                        <>Saving...</>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Profile Settings */}
            <TabsContent value="profile">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>Manage your personal information and profile settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" defaultValue={settings?.name || ''} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" defaultValue={settings?.email || ''} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" defaultValue={settings?.phone || ''} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        defaultValue={settings?.bio || ''}
                        rows={4}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? (
                        <>Saving...</>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Update Password */}
            <TabsContent value="password">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>Update Password</CardTitle>
                    <CardDescription>Change your password securely</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" ref={currentPasswordRef} placeholder="Enter your current password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" ref={newPasswordRef} placeholder="Enter a new password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" ref={confirmPasswordRef} placeholder="Confirm your new password" />
                    </div>
                    {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                    {passwordSuccess && <p className="text-green-600 text-sm">{passwordSuccess}</p>}
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? (
                        <>Saving...</>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}
