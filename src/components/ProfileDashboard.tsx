import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useReceiptSettings } from '@/hooks/useReceiptSettings';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  Store, 
  Lock, 
  Receipt, 
  Settings, 
  Save,
  Eye,
  EyeOff,
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText
} from 'lucide-react';

interface ReceiptSettings {
  show_logo: boolean;
  logo_url?: string;
  header_text?: string;
  footer_text?: string;
  show_address: boolean;
  show_phone: boolean;
  show_email: boolean;
  show_tax_number: boolean;
  paper_size: 'thermal_58' | 'thermal_80' | 'a4';
  font_size: 'small' | 'medium' | 'large';
  show_qr_code: boolean;
  currency_symbol: string;
  show_tax: boolean;
  tax_rate: number;
  tax_type: 'percentage' | 'fixed';
}

export const ProfileDashboard: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { settings: receiptSettings, saveSettings, loading: receiptLoading } = useReceiptSettings();
  const { toast } = useToast();
  
  // State untuk form data
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
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
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [localReceiptSettings, setLocalReceiptSettings] = useState<ReceiptSettings>({
    show_logo: false,
    header_text: '',
    footer_text: 'Terima kasih atas kunjungan Anda!',
    show_address: true,
    show_phone: true,
    show_email: false,
    show_tax_number: false,
    paper_size: 'thermal_80',
    font_size: 'medium',
    show_qr_code: false,
    currency_symbol: 'Rp',
    show_tax: false,
    tax_rate: 11.0,
    tax_type: 'percentage'
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [loading, setLoading] = useState(false);

  // Load data profil saat komponen dimount
  useEffect(() => {
    loadProfileData();
    loadReceiptSettings();
  }, [user]);

  const loadProfileData = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && !error.message.includes('relation')) {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setProfileData({
          full_name: data.full_name || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          store_name: data.store_name || '',
          business_name: data.business_name || '',
          business_type: data.business_type || 'retail',
          address: data.address || '',
          city: data.city || '',
          province: data.province || '',
          postal_code: data.postal_code || '',
          country: data.country || 'Indonesia',
          tax_number: data.tax_number || '',
          business_license: data.business_license || '',
          description: data.description || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const loadReceiptSettings = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('receipt_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && !error.message.includes('relation')) {
        console.error('Error loading receipt settings:', error);
        return;
      }

      if (data) {
        setLocalReceiptSettings({
          show_logo: data.show_logo || false,
          logo_url: data.logo_url || '',
          header_text: data.header_text || '',
          footer_text: data.footer_text || 'Terima kasih atas kunjungan Anda!',
          show_address: data.show_address ?? true,
          show_phone: data.show_phone ?? true,
          show_email: data.show_email || false,
          show_tax_number: data.show_tax_number || false,
          paper_size: (data.paper_size as 'thermal_58' | 'thermal_80' | 'a4') || 'thermal_80',
          font_size: (data.font_size as 'small' | 'medium' | 'large') || 'medium',
          show_qr_code: data.show_qr_code || false,
          currency_symbol: data.currency_symbol || 'Rp',
          show_tax: data.show_tax || false,
          tax_rate: data.tax_rate || 11.0,
          tax_type: (data.tax_type as 'percentage' | 'fixed') || 'percentage'
        });
      }
    } catch (error) {
      console.error('Error loading receipt settings:', error);
    }
  };

  const handleProfileSave = async () => {
    setLoading(true);
    const result = await updateProfile(profileData);
    if (result.success) {
      toast({
        title: "Berhasil",
        description: "Profil berhasil diperbarui",
      });
    }
    setLoading(false);
  };

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({
        title: "Error",
        description: "Password baru dan konfirmasi tidak cocok",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast({
        title: "Error", 
        description: "Password minimal 6 karakter",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const result = await changePassword(passwordData.current_password, passwordData.new_password);
    if (result.success) {
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      toast({
        title: "Berhasil",
        description: "Password berhasil diubah",
      });
    }
    setLoading(false);
  };

  const saveReceiptSettings = async () => {
    if (!user?.id) return;

    try {
      const result = await saveSettings(localReceiptSettings);
      
      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Pengaturan struk berhasil disimpan.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Gagal menyimpan pengaturan struk",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error saving receipt settings:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Dashboard Profil & Pengaturan
        </h1>
        <p className="text-muted-foreground mt-2">
          Kelola profil akun, toko, dan pengaturan aplikasi Anda
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="store" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Toko
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Keamanan
          </TabsTrigger>
          <TabsTrigger value="receipt" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Struk
          </TabsTrigger>
        </TabsList>

        {/* Tab Profil Personal */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Personal
              </CardTitle>
              <CardDescription>
                Kelola informasi personal dan kontak Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nama Lengkap</Label>
                  <Input
                    id="full_name"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    placeholder="08123456789"
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-end">
                <Button onClick={handleProfileSave} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Menyimpan...' : 'Simpan Profil'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Profil Toko */}
        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Profil Toko & Bisnis
              </CardTitle>
              <CardDescription>
                Kelola informasi toko dan bisnis Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store_name">Nama Toko</Label>
                  <Input
                    id="store_name"
                    value={profileData.store_name}
                    onChange={(e) => setProfileData({...profileData, store_name: e.target.value})}
                    placeholder="Toko Serbaguna"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_name">Nama Bisnis</Label>
                  <Input
                    id="business_name"
                    value={profileData.business_name}
                    onChange={(e) => setProfileData({...profileData, business_name: e.target.value})}
                    placeholder="PT. Serbaguna Jaya"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_type">Jenis Bisnis</Label>
                  <Select value={profileData.business_type} onValueChange={(value) => setProfileData({...profileData, business_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="wholesale">Grosir</SelectItem>
                      <SelectItem value="restaurant">Restoran</SelectItem>
                      <SelectItem value="cafe">Cafe</SelectItem>
                      <SelectItem value="pharmacy">Apotek</SelectItem>
                      <SelectItem value="grocery">Toko Kelontong</SelectItem>
                      <SelectItem value="fashion">Fashion</SelectItem>
                      <SelectItem value="electronics">Elektronik</SelectItem>
                      <SelectItem value="other">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax_number">NPWP</Label>
                  <Input
                    id="tax_number"
                    value={profileData.tax_number}
                    onChange={(e) => setProfileData({...profileData, tax_number: e.target.value})}
                    placeholder="12.345.678.9-012.000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Alamat Lengkap</Label>
                <Textarea
                  id="address"
                  value={profileData.address}
                  onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                  placeholder="Jl. Contoh No. 123, RT/RW 01/02"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Kota</Label>
                  <Input
                    id="city"
                    value={profileData.city}
                    onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                    placeholder="Jakarta"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Provinsi</Label>
                  <Input
                    id="province"
                    value={profileData.province}
                    onChange={(e) => setProfileData({...profileData, province: e.target.value})}
                    placeholder="DKI Jakarta"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Kode Pos</Label>
                  <Input
                    id="postal_code"
                    value={profileData.postal_code}
                    onChange={(e) => setProfileData({...profileData, postal_code: e.target.value})}
                    placeholder="12345"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi Bisnis</Label>
                <Textarea
                  id="description"
                  value={profileData.description}
                  onChange={(e) => setProfileData({...profileData, description: e.target.value})}
                  placeholder="Deskripsi singkat tentang bisnis Anda..."
                  rows={3}
                />
              </div>

              <Separator />
              
              <div className="flex justify-end">
                <Button onClick={handleProfileSave} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Menyimpan...' : 'Simpan Profil Toko'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Keamanan */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Keamanan Akun
              </CardTitle>
              <CardDescription>
                Ubah password dan kelola keamanan akun Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current_password">Password Saat Ini</Label>
                  <div className="relative">
                    <Input
                      id="current_password"
                      type={showPassword.current ? "text" : "password"}
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                      placeholder="Masukkan password saat ini"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword({...showPassword, current: !showPassword.current})}
                    >
                      {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_password">Password Baru</Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showPassword.new ? "text" : "password"}
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                      placeholder="Masukkan password baru (min. 6 karakter)"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
                    >
                      {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Konfirmasi Password Baru</Label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      type={showPassword.confirm ? "text" : "password"}
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                      placeholder="Ulangi password baru"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
                    >
                      {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />
              
              <div className="flex justify-end">
                <Button 
                  onClick={handlePasswordChange} 
                  disabled={loading || !passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {loading ? 'Mengubah...' : 'Ubah Password'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Pengaturan Struk */}
        <TabsContent value="receipt">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Pengaturan Struk Pembelian
              </CardTitle>
              <CardDescription>
                Kustomisasi tampilan dan format struk pembelian
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Header & Footer */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Header & Footer</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="header_text">Teks Header</Label>
                    <Input
                      id="header_text"
                      value={localReceiptSettings.header_text}
                      onChange={(e) => setLocalReceiptSettings({...localReceiptSettings, header_text: e.target.value})}
                      placeholder="Selamat datang di toko kami!"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="footer_text">Teks Footer</Label>
                    <Textarea
                      id="footer_text"
                      value={localReceiptSettings.footer_text}
                      onChange={(e) => setLocalReceiptSettings({...localReceiptSettings, footer_text: e.target.value})}
                      placeholder="Terima kasih atas kunjungan Anda!"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Informasi yang Ditampilkan */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informasi yang Ditampilkan</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show_address"
                      checked={localReceiptSettings.show_address}
                      onCheckedChange={(checked) => setLocalReceiptSettings({...localReceiptSettings, show_address: checked})}
                    />
                    <Label htmlFor="show_address" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Alamat Toko
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show_phone"
                      checked={localReceiptSettings.show_phone}
                      onCheckedChange={(checked) => setLocalReceiptSettings({...localReceiptSettings, show_phone: checked})}
                    />
                    <Label htmlFor="show_phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Nomor Telepon
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show_email"
                      checked={localReceiptSettings.show_email}
                      onCheckedChange={(checked) => setLocalReceiptSettings({...localReceiptSettings, show_email: checked})}
                    />
                    <Label htmlFor="show_email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show_tax_number"
                      checked={localReceiptSettings.show_tax_number}
                      onCheckedChange={(checked) => setLocalReceiptSettings({...localReceiptSettings, show_tax_number: checked})}
                    />
                    <Label htmlFor="show_tax_number" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      NPWP
                    </Label>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Pengaturan Pajak */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pengaturan Pajak</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show_tax"
                      checked={localReceiptSettings.show_tax}
                      onCheckedChange={(checked) => setLocalReceiptSettings({...localReceiptSettings, show_tax: checked})}
                    />
                    <Label htmlFor="show_tax" className="flex items-center gap-2">
                      <Receipt className="h-4 w-4" />
                      Aktifkan Pajak
                    </Label>
                  </div>
                  {localReceiptSettings.show_tax && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="tax_rate">Tarif Pajak</Label>
                        <Input
                          id="tax_rate"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={localReceiptSettings.tax_rate}
                          onChange={(e) => setLocalReceiptSettings({...localReceiptSettings, tax_rate: parseFloat(e.target.value) || 0})}
                          placeholder="11.0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tax_type">Jenis Pajak</Label>
                        <Select value={localReceiptSettings.tax_type} onValueChange={(value: any) => setLocalReceiptSettings({...localReceiptSettings, tax_type: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Persentase (%)</SelectItem>
                            <SelectItem value="fixed">Nominal Tetap</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              {/* Format & Tampilan */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Format & Tampilan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paper_size">Ukuran Kertas</Label>
                    <Select value={localReceiptSettings.paper_size} onValueChange={(value: any) => setLocalReceiptSettings({...localReceiptSettings, paper_size: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="thermal_58">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">58mm</Badge>
                            Thermal 58mm
                          </div>
                        </SelectItem>
                        <SelectItem value="thermal_80">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">80mm</Badge>
                            Thermal 80mm (Recommended)
                          </div>
                        </SelectItem>
                        <SelectItem value="a4">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">A4</Badge>
                            A4 Paper
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="font_size">Ukuran Font</Label>
                    <Select value={localReceiptSettings.font_size} onValueChange={(value: any) => setLocalReceiptSettings({...localReceiptSettings, font_size: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Kecil (10px)</SelectItem>
                        <SelectItem value="medium">Sedang (12px)</SelectItem>
                        <SelectItem value="large">Besar (14px)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency_symbol">Simbol Mata Uang</Label>
                    <Input
                      id="currency_symbol"
                      value={localReceiptSettings.currency_symbol}
                      onChange={(e) => setLocalReceiptSettings({...localReceiptSettings, currency_symbol: e.target.value})}
                      placeholder="Rp"
                    />
                  </div>
                </div>

                {/* Preview Section */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg border-2 border-dashed">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    Preview Struk
                  </h4>
                  <div className="bg-white p-4 rounded border text-xs font-mono max-w-xs mx-auto shadow-sm">
                    {localReceiptSettings.header_text && (
                      <div className="text-center font-bold mb-2">{localReceiptSettings.header_text}</div>
                    )}
                    <div className="text-center font-bold">{profileData.store_name || 'Nama Toko'}</div>
                    {localReceiptSettings.show_address && profileData.address && (
                      <div className="text-center text-xs">{profileData.address}</div>
                    )}
                    {localReceiptSettings.show_phone && profileData.phone && (
                      <div className="text-center text-xs">Tel: {profileData.phone}</div>
                    )}
                    {localReceiptSettings.show_email && profileData.email && (
                      <div className="text-center text-xs">Email: {profileData.email}</div>
                    )}
                    {localReceiptSettings.show_tax_number && profileData.tax_number && (
                      <div className="text-center text-xs">NPWP: {profileData.tax_number}</div>
                    )}
                    <div className="border-t border-dashed my-2"></div>
                    <div className="flex justify-between">
                      <span>Contoh Produk</span>
                      <span>{localReceiptSettings.currency_symbol} 25.000</span>
                    </div>
                    <div className="border-t border-dashed my-2"></div>
                    <div className="flex justify-between font-bold">
                      <span>TOTAL</span>
                      <span>{localReceiptSettings.currency_symbol} 25.000</span>
                    </div>
                    {localReceiptSettings.footer_text && (
                      <div className="text-center mt-2 text-xs">{localReceiptSettings.footer_text}</div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />
              
              <div className="flex justify-end">
                <Button onClick={saveReceiptSettings} disabled={receiptLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {receiptLoading ? 'Menyimpan...' : 'Simpan Pengaturan Struk'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
