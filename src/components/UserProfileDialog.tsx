import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ChangePasswordDialog } from "./ChangePasswordDialog";
import { Store, User, MapPin, Building, Phone, Mail } from "lucide-react";

interface UserProfile {
  full_name?: string;
  email?: string;
  phone?: string;
  store_name?: string;
  business_name?: string;
  business_type?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  tax_number?: string;
  business_license?: string;
  description?: string;
}

interface UserProfileDialogProps {
  children: React.ReactNode;
}

export const UserProfileDialog = ({ children }: UserProfileDialogProps) => {
  const { user, updateProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({});
  const [formData, setFormData] = useState<UserProfile>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Try to fetch user profile
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // If table doesn't exist or other database error, use empty profile
      if (error && (error.message.includes('relation') || error.message.includes('does not exist'))) {
        console.log('user_profiles table not found, using empty profile');
        const emptyProfile = {
          full_name: user.email || '',
          email: user.email || '',
          phone: '',
          store_name: '',
          business_name: '',
          business_type: 'retail',
          address: '',
          city: '',
          province: '',
          postal_code: '',
          country: 'Indonesia',
          tax_number: '',
          business_license: '',
          description: ''
        };
        setProfile(emptyProfile);
        setFormData(emptyProfile);
        return;
      }

      if (error) {
        console.error('Error fetching profile:', error);
      }
      
      const profileData = data || {
        full_name: user.email || '',
        email: user.email || '',
        phone: '',
        store_name: '',
        business_name: '',
        business_type: 'retail',
        address: '',
        city: '',
        province: '',
        postal_code: '',
        country: 'Indonesia',
        tax_number: '',
        business_license: '',
        description: ''
      };
      setProfile(profileData);
      setFormData(profileData);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      const emptyProfile = {
        full_name: user.email || '',
        email: user.email || '',
        phone: '',
        store_name: '',
        business_name: '',
        business_type: 'retail',
        address: '',
        city: '',
        province: '',
        postal_code: '',
        country: 'Indonesia',
        tax_number: '',
        business_license: '',
        description: ''
      };
      setProfile(emptyProfile);
      setFormData(emptyProfile);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && user?.id) {
      fetchProfile();
    }
  }, [open, user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    const result = await updateProfile(formData);
    
    if (result.success) {
      setOpen(false);
      setProfile(formData);
    }
    
    setIsSubmitting(false);
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Profil Toko & Pengguna
          </DialogTitle>
          <DialogDescription>
            Kelola informasi toko, bisnis, dan profil pengguna Anda.
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <User className="h-4 w-4" />
                <h3 className="font-medium">Informasi Pribadi</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nama Lengkap</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name || ''}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <Input
                      id="email"
                      value={formData.email || user?.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Email"
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <Input
                      id="phone"
                      value={formData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Contoh: 08123456789"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Store Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <Store className="h-4 w-4" />
                <h3 className="font-medium">Informasi Toko</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store_name">Nama Toko</Label>
                  <Input
                    id="store_name"
                    value={formData.store_name || ''}
                    onChange={(e) => handleInputChange('store_name', e.target.value)}
                    placeholder="Contoh: Toko Serbaguna Maju"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_name">Nama Bisnis/Perusahaan</Label>
                  <Input
                    id="business_name"
                    value={formData.business_name || ''}
                    onChange={(e) => handleInputChange('business_name', e.target.value)}
                    placeholder="Contoh: CV. Maju Bersama"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_type">Jenis Bisnis</Label>
                  <Select 
                    value={formData.business_type || 'retail'} 
                    onValueChange={(value) => handleInputChange('business_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis bisnis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">Retail/Eceran</SelectItem>
                      <SelectItem value="wholesale">Grosir</SelectItem>
                      <SelectItem value="restaurant">Restoran/Cafe</SelectItem>
                      <SelectItem value="service">Jasa</SelectItem>
                      <SelectItem value="manufacturing">Manufaktur</SelectItem>
                      <SelectItem value="other">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax_number">NPWP (Opsional)</Label>
                  <Input
                    id="tax_number"
                    value={formData.tax_number || ''}
                    onChange={(e) => handleInputChange('tax_number', e.target.value)}
                    placeholder="Contoh: 12.345.678.9-012.000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi Toko</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Ceritakan tentang toko Anda..."
                  rows={3}
                />
              </div>
            </div>

            {/* Address Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <MapPin className="h-4 w-4" />
                <h3 className="font-medium">Alamat Toko</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Alamat Lengkap</Label>
                  <Textarea
                    id="address"
                    value={formData.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Jl. Merdeka No. 123, RT 01/RW 02"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Kota</Label>
                    <Input
                      id="city"
                      value={formData.city || ''}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Jakarta Pusat"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="province">Provinsi</Label>
                    <Input
                      id="province"
                      value={formData.province || ''}
                      onChange={(e) => handleInputChange('province', e.target.value)}
                      placeholder="DKI Jakarta"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Kode Pos</Label>
                    <Input
                      id="postal_code"
                      value={formData.postal_code || ''}
                      onChange={(e) => handleInputChange('postal_code', e.target.value)}
                      placeholder="10110"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <ChangePasswordDialog>
                <Button type="button" variant="outline">
                  Ubah Password
                </Button>
              </ChangePasswordDialog>
              
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Profil"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
