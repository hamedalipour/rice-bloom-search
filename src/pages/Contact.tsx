import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("لطفاً تمام فیلدهای الزامی را پر کنید");
      return;
    }

    toast.success("پیام شما با موفقیت ارسال شد", {
      description: "به زودی با شما تماس خواهیم گرفت",
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      message: "",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-muted/50 py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">تماس با ما</h1>
            <p className="text-lg text-muted-foreground">
              سوالی دارید؟ ما اینجا هستیم تا به شما کمک کنیم
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Info */}
              <div className="space-y-6">
                <Card className="border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 flex-shrink-0">
                        <Phone className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold mb-2 text-foreground">تلفن تماس</h3>
                        <p className="text-muted-foreground" dir="ltr">021-12345678</p>
                        <p className="text-muted-foreground" dir="ltr">0912-3456789</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 flex-shrink-0">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold mb-2 text-foreground">ایمیل</h3>
                        <p className="text-muted-foreground">info@atrshalizar.ir</p>
                        <p className="text-muted-foreground">support@atrshalizar.ir</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 flex-shrink-0">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold mb-2 text-foreground">آدرس</h3>
                        <p className="text-muted-foreground">
                          تهران، خیابان ولیعصر، پلاک ۱۲۳
                        </p>
                        <p className="text-muted-foreground">
                          کد پستی: ۱۹۸۷۶۵۴۳۲۱
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Working Hours */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>ساعات کاری</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-muted-foreground">
                      <div className="flex justify-between">
                        <span>شنبه - چهارشنبه:</span>
                        <span>۹:۰۰ - ۱۸:۰۰</span>
                      </div>
                      <div className="flex justify-between">
                        <span>پنج‌شنبه:</span>
                        <span>۹:۰۰ - ۱۳:۰۰</span>
                      </div>
                      <div className="flex justify-between">
                        <span>جمعه:</span>
                        <span>تعطیل</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-2xl">فرم تماس</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">نام و نام خانوادگی *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            placeholder="نام خود را وارد کنید"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">ایمیل *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                            placeholder="example@email.com"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">شماره تماس</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          placeholder="09123456789"
                          dir="ltr"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">پیام شما *</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) =>
                            setFormData({ ...formData, message: e.target.value })
                          }
                          placeholder="پیام خود را اینجا بنویسید..."
                          rows={6}
                          required
                        />
                      </div>

                      <Button type="submit" size="lg" className="w-full gap-2">
                        <Send className="h-5 w-5" />
                        ارسال پیام
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
