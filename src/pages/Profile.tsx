import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Mail, Calendar, MapPin, Phone, Edit, CheckCircle, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ProfileEditForm from '@/components/ProfileEditForm';

const Profile = () => {
  const { user } = useAuth();
  const { profile, loading, isProfileComplete } = useUserProfile();
  const [showEditForm, setShowEditForm] = useState(false);

  if (!user) {
    return null;
  }

  if (showEditForm) {
    return (
      <>
        <Navbar />
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-green-50 to-green-100 py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={() => setShowEditForm(false)}
                className="mb-4"
              >
                بازگشت به پروفایل
              </Button>
            </div>
            <ProfileEditForm />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-green-50 to-green-100 py-12 px-4" dir="rtl">
        <div className="container mx-auto max-w-4xl space-y-6">
          {/* Profile Completion Alert */}
          {!loading && profile && !isProfileComplete() && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <div className="flex-1">
                    <p className="text-amber-800 font-medium">پروفایل شما ناقص است</p>
                    <p className="text-amber-700 text-sm">لطفاً اطلاعات کامل خود را وارد کنید تا بتوانید سفارش ثبت کنید.</p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => setShowEditForm(true)}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    تکمیل پروفایل
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <User className="h-6 w-6" />
                  پروفایل کاربر
                </CardTitle>
                <div className="flex items-center gap-2">
                  {isProfileComplete() && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      تکمیل شده
                    </Badge>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowEditForm(true)}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    ویرایش
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">در حال بارگذاری...</p>
                </div>
              ) : (
                <>
                  {/* Profile Header */}
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold">
                      {profile?.first_name && profile?.last_name 
                        ? `${profile.first_name} ${profile.last_name}`
                        : 'کاربر'
                      }
                    </h2>
                    <Badge variant="secondary" className="mt-2">
                      {user.email_confirmed_at ? 'تایید شده' : 'تایید نشده'}
                    </Badge>
                  </div>

                  {/* Account Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">اطلاعات حساب کاربری</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Mail className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="text-sm text-gray-600">ایمیل</p>
                          <p className="font-medium">{user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="text-sm text-gray-600">عضو از</p>
                          <p className="font-medium">
                            {new Date(user.created_at).toLocaleDateString('fa-IR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Personal Information */}
                  {profile && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">اطلاعات شخصی</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profile.phone_number && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Phone className="h-5 w-5 text-gray-600" />
                            <div>
                              <p className="text-sm text-gray-600">شماره تلفن</p>
                              <p className="font-medium">{profile.phone_number}</p>
                            </div>
                          </div>
                        )}

                        {(profile.city || profile.state) && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <MapPin className="h-5 w-5 text-gray-600" />
                            <div>
                              <p className="text-sm text-gray-600">شهر و استان</p>
                              <p className="font-medium">
                                {[profile.city, profile.state].filter(Boolean).join('، ')}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {profile.address_line_1 && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">آدرس</p>
                          <p className="font-medium">
                            {profile.address_line_1}
                            {profile.address_line_2 && `, ${profile.address_line_2}`}
                          </p>
                          {profile.postal_code && (
                            <p className="text-sm text-gray-600 mt-1">
                              کد پستی: {profile.postal_code}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Empty State */}
                  {!loading && !profile && (
                    <div className="text-center py-8">
                      <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">پروفایل شما هنوز ایجاد نشده</h3>
                      <p className="text-gray-600 mb-4">برای استفاده از تمام امکانات، پروفایل خود را تکمیل کنید.</p>
                      <Button onClick={() => setShowEditForm(true)}>
                        ایجاد پروفایل
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Profile;