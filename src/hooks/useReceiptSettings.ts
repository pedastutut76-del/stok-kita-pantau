import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

export const useReceiptSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<ReceiptSettings>({
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
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
        setSettings({
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
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: Partial<ReceiptSettings>) => {
    if (!user?.id) return { success: false, error: 'User not authenticated' };

    try {
      setLoading(true);
      
      // Use upsert to handle both insert and update cases
      const { data, error } = await supabase
        .from('receipt_settings')
        .upsert(
          {
            user_id: user.id,
            ...newSettings
          },
          {
            onConflict: 'user_id'
          }
        )
        .select()
        .single();

      if (error) {
        console.error('Error saving receipt settings:', error);
        return { success: false, error: error.message };
      }

      // Update local state with saved data
      if (data) {
        setSettings({
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

      return { success: true };
    } catch (error: any) {
      console.error('Error saving receipt settings:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    settings,
    loading,
    saveSettings,
    refreshSettings: loadSettings
  };
};
