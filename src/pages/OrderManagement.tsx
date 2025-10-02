import React, { useState, useEffect } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Package, Search, Eye, Edit, Calendar, User, MapPin, Phone, Mail } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Order = Tables<'orders'>;

const OrderManagement: React.FC = () => {
  const { fetchOrders, updateOrderStatus, loading } = useOrders();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const loadOrders = async () => {
    const { data, error } = await fetchOrders();
    if (data) {
      setOrders(data);
    } else if (error) {
      toast.error('خطا در بارگذاری سفارشات');
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    const { data, error } = await updateOrderStatus(orderId, newStatus);
    if (data) {
      toast.success('وضعیت سفارش به‌روزرسانی شد');
      loadOrders(); // Refresh orders
    } else if (error) {
      toast.error('خطا در به‌روزرسانی وضعیت سفارش');
    }
  };

  const getStatusBadge = (status: string | null) => {
    const statusConfig = {
      pending: { label: 'در انتظار', variant: 'secondary' as const },
      processing: { label: 'در حال پردازش', variant: 'default' as const },
      shipped: { label: 'ارسال شده', variant: 'outline' as const },
      delivered: { label: 'تحویل شده', variant: 'default' as const },
      cancelled: { label: 'لغو شده', variant: 'destructive' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('fa-IR') + ' تومان';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">مدیریت سفارشات</h1>
        <p className="text-gray-600">مشاهده و مدیریت تمام سفارشات دریافتی</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            جستجو و فیلتر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="جستجو بر اساس نام، ایمیل یا شناسه سفارش..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="وضعیت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                  <SelectItem value="pending">در انتظار</SelectItem>
                  <SelectItem value="processing">در حال پردازش</SelectItem>
                  <SelectItem value="shipped">ارسال شده</SelectItem>
                  <SelectItem value="delivered">تحویل شده</SelectItem>
                  <SelectItem value="cancelled">لغو شده</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            سفارشات ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">در حال بارگذاری...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">هیچ سفارشی یافت نشد</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>شناسه سفارش</TableHead>
                    <TableHead>مشتری</TableHead>
                    <TableHead>مبلغ</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>تاریخ</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono">
                        #{order.id.slice(-8)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customer_name}</div>
                          <div className="text-sm text-gray-500">{order.customer_email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(order.total_amount)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(order.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
                              <DialogHeader>
                                <DialogTitle>جزئیات سفارش #{order.id.slice(-8)}</DialogTitle>
                              </DialogHeader>
                              {selectedOrder && (
                                <div className="space-y-6">
                                  {/* Customer Info */}
                                  <div>
                                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                      <User className="h-5 w-5" />
                                      اطلاعات مشتری
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="font-medium">نام:</span> {selectedOrder.customer_name}
                                      </div>
                                      <div>
                                        <span className="font-medium">ایمیل:</span> {selectedOrder.customer_email}
                                      </div>
                                      <div>
                                        <span className="font-medium">تلفن:</span> {selectedOrder.customer_phone}
                                      </div>
                                      <div>
                                        <span className="font-medium">شهر:</span> {selectedOrder.customer_city}
                                      </div>
                                      <div className="col-span-2">
                                        <span className="font-medium">آدرس:</span> {selectedOrder.customer_address}
                                      </div>
                                      <div>
                                        <span className="font-medium">کد پستی:</span> {selectedOrder.customer_postal_code}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Order Items */}
                                  <div>
                                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                      <Package className="h-5 w-5" />
                                      محصولات سفارش
                                    </h3>
                                    {selectedOrder.order_items && (
                                      <div className="space-y-3">
                                        {(selectedOrder.order_items as any[]).map((item, index) => (
                                          <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                                            <img 
                                              src={item.image_url} 
                                              alt={item.name}
                                              className="w-16 h-16 object-cover rounded"
                                            />
                                            <div className="flex-1">
                                              <h4 className="font-medium">{item.name}</h4>
                                              <p className="text-sm text-gray-500">
                                                {item.quantity} × {formatPrice(item.price)}
                                              </p>
                                            </div>
                                            <div className="font-medium">
                                              {formatPrice(item.price * item.quantity)}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {/* Order Notes */}
                                  {selectedOrder.notes && (
                                    <div>
                                      <h3 className="text-lg font-semibold mb-3">توضیحات سفارش</h3>
                                      <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedOrder.notes}</p>
                                    </div>
                                  )}

                                  {/* Order Status Update */}
                                  <div>
                                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                      <Edit className="h-5 w-5" />
                                      به‌روزرسانی وضعیت
                                    </h3>
                                    <div className="flex gap-3">
                                      <Select
                                        value={selectedOrder.status || 'pending'}
                                        onValueChange={(value) => handleStatusUpdate(selectedOrder.id, value)}
                                      >
                                        <SelectTrigger className="w-48">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="pending">در انتظار</SelectItem>
                                          <SelectItem value="processing">در حال پردازش</SelectItem>
                                          <SelectItem value="shipped">ارسال شده</SelectItem>
                                          <SelectItem value="delivered">تحویل شده</SelectItem>
                                          <SelectItem value="cancelled">لغو شده</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  {/* Order Total */}
                                  <div className="border-t pt-4">
                                    <div className="flex justify-between items-center text-lg font-bold">
                                      <span>مجموع کل:</span>
                                      <span className="text-green-600">{formatPrice(selectedOrder.total_amount)}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderManagement;