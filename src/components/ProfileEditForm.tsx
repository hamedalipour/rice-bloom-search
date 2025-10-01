import { useState, useEffect } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, User } from 'lucide-react';

interface ProfileFormData {
  first_name: string;
  last_name: string;
  phone_number: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

const ProfileEditForm = () => {
  const { profile, loading, updating, updateProfile, createProfile } = useUserProfile();
  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: '',
    last_name: '',
    phone_number: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Iran',
  });

  const [errors, setErrors] = useState<Partial<ProfileFormData>>({});

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone_number: profile.phone_number || '',
        address_line_1: profile.address_line_1 || '',
        address_line_2: profile.address_line_2 || '',
        city: profile.city || '',
        state: profile.state || '',
        postal_code: profile.postal_code || '',
        country: profile.country || 'Iran',
      });
    }
  }, [profile]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileFormData> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'نام الزامی است';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'نام خانوادگی الزامی است';
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'شماره تلفن الزامی است';
    } else if (!/^(\+98|0)?9\d{9}$/.test(formData.phone_number.replace(/\s/g, ''))) {
      newErrors.phone_number = 'شماره تلفن معتبر نیست';
    }

    if (!formData.address_line_1.trim()) {
      newErrors.address_line_1 = 'آدرس الزامی است';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'شهر الزامی است';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'استان الزامی است';
    }

    if (!formData.postal_code.trim()) {
      newErrors.postal_code = 'کد پستی الزامی است';
    } else if (!/^\d{10}$/.test(formData.postal_code.replace(/\s/g, ''))) {
      newErrors.postal_code = 'کد پستی باید ۱۰ رقم باشد';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const cleanedData = {
      ...formData,
      phone_number: formData.phone_number.replace(/\s/g, ''),
      postal_code: formData.postal_code.replace(/\s/g, ''),
    };

    if (profile) {
      await updateProfile(cleanedData);
    } else {
      await createProfile(cleanedData);
    }
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto" dir="rtl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
          <User className="h-6 w-6" />
          ویرایش پروفایل
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">اطلاعات شخصی</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">نام *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="نام خود را وارد کنید"
                  className={errors.first_name ? 'border-red-500' : ''}
                />
                {errors.first_name && (
                  <p className="text-sm text-red-500">{errors.first_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">نام خانوادگی *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="نام خانوادگی خود را وارد کنید"
                  className={errors.last_name ? 'border-red-500' : ''}
                />
                {errors.last_name && (
                  <p className="text-sm text-red-500">{errors.last_name}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">شماره تلفن *</Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                placeholder="09123456789"
                className={errors.phone_number ? 'border-red-500' : ''}
              />
              {errors.phone_number && (
                <p className="text-sm text-red-500">{errors.phone_number}</p>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">اطلاعات آدرس</h3>
            
            <div className="space-y-2">
              <Label htmlFor="address_line_1">آدرس *</Label>
              <Textarea
                id="address_line_1"
                value={formData.address_line_1}
                onChange={(e) => handleInputChange('address_line_1', e.target.value)}
                placeholder="آدرس کامل خود را وارد کنید"
                className={errors.address_line_1 ? 'border-red-500' : ''}
                rows={3}
              />
              {errors.address_line_1 && (
                <p className="text-sm text-red-500">{errors.address_line_1}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_line_2">آدرس تکمیلی (اختیاری)</Label>
              <Input
                id="address_line_2"
                value={formData.address_line_2}
                onChange={(e) => handleInputChange('address_line_2', e.target.value)}
                placeholder="پلاک، واحد، طبقه و..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">شهر *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="شهر"
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">استان *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="استان"
                  className={errors.state ? 'border-red-500' : ''}
                />
                {errors.state && (
                  <p className="text-sm text-red-500">{errors.state}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postal_code">کد پستی *</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => handleInputChange('postal_code', e.target.value)}
                  placeholder="1234567890"
                  className={errors.postal_code ? 'border-red-500' : ''}
                  maxLength={10}
                />
                {errors.postal_code && (
                  <p className="text-sm text-red-500">{errors.postal_code}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">کشور</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="کشور"
                  disabled
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={updating}
          >
            {updating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                در حال ذخیره...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                ذخیره تغییرات
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileEditForm;