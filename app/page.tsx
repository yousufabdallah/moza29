'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast, Toaster } from 'sonner';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  MapPin, 
  Phone, 
  DollarSign, 
  FileText, 
  Search,
  Download,
  Upload,
  BarChart3
} from 'lucide-react';

interface Booking {
  id: string;
  date: string;
  location: string;
  phone: string;
  totalPrice: number;
  paidAmount: number;
  remainingAmount: number;
  details: string;
  createdAt: string;
}

export default function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    date: '',
    location: '',
    phone: '',
    totalPrice: '',
    paidAmount: '',
    details: ''
  });

  // تحميل البيانات من Local Storage عند بدء التطبيق
  useEffect(() => {
    const savedBookings = localStorage.getItem('bookings');
    if (savedBookings) {
      try {
        setBookings(JSON.parse(savedBookings));
      } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
      }
    }
  }, []);

  // حفظ البيانات في Local Storage عند تغيير الحجوزات
  useEffect(() => {
    if (bookings.length > 0) {
      localStorage.setItem('bookings', JSON.stringify(bookings));
    }
  }, [bookings]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateRemainingAmount = (total: number, paid: number) => {
    return Math.max(0, total - paid);
  };

  const formatDateToGregorian = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleSubmit = () => {
    if (!formData.date || !formData.location || !formData.phone) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const totalPrice = parseFloat(formData.totalPrice) || 0;
    const paidAmount = parseFloat(formData.paidAmount) || 0;
    const remainingAmount = calculateRemainingAmount(totalPrice, paidAmount);

    const bookingData: Booking = {
      id: editingBooking?.id || Date.now().toString(),
      date: formData.date,
      location: formData.location,
      phone: formData.phone,
      totalPrice,
      paidAmount,
      remainingAmount,
      details: formData.details,
      createdAt: editingBooking?.createdAt || new Date().toISOString()
    };

    if (editingBooking) {
      setBookings(prev => prev.map(booking => 
        booking.id === editingBooking.id ? bookingData : booking
      ));
      toast.success('تم تحديث الحجز بنجاح');
    } else {
      setBookings(prev => [...prev, bookingData]);
      toast.success('تم إضافة الحجز بنجاح');
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      date: '',
      location: '',
      phone: '',
      totalPrice: '',
      paidAmount: '',
      details: ''
    });
    setEditingBooking(null);
  };

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setFormData({
      date: booking.date,
      location: booking.location,
      phone: booking.phone,
      totalPrice: booking.totalPrice.toString(),
      paidAmount: booking.paidAmount.toString(),
      details: booking.details
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setBookings(prev => prev.filter(booking => booking.id !== id));
    toast.success('تم حذف الحجز بنجاح');
  };

  const exportData = () => {
    const dataStr = JSON.stringify(bookings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bookings-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('تم تصدير البيانات بنجاح');
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedBookings = JSON.parse(e.target?.result as string);
          setBookings(importedBookings);
          toast.success('تم استيراد البيانات بنجاح');
        } catch (error) {
          toast.error('خطأ في استيراد البيانات');
        }
      };
      reader.readAsText(file);
    }
  };

  const filteredBookings = bookings.filter(booking =>
    booking.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.phone.includes(searchTerm) ||
    booking.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: bookings.length,
    totalRevenue: bookings.reduce((sum, booking) => sum + booking.totalPrice, 0),
    totalPaid: bookings.reduce((sum, booking) => sum + booking.paidAmount, 0),
    totalRemaining: bookings.reduce((sum, booking) => sum + booking.remainingAmount, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            نظام إدارة الحجوزات
          </h1>
          <p className="text-gray-600">
            إدارة شاملة وآمنة لجميع حجوزاتكم
          </p>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الحجوزات</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.totalRevenue.toLocaleString()} ر.س
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المبلغ المدفوع</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalPaid.toLocaleString()} ر.س
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المبلغ المتبقي</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.totalRemaining.toLocaleString()} ر.س
              </div>
            </CardContent>
          </Card>
        </div>

        {/* شريط الأدوات */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث في الحجوزات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={exportData}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  تصدير البيانات
                </Button>
                
                <label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 cursor-pointer"
                    asChild
                  >
                    <span>
                      <Upload className="h-4 w-4" />
                      استيراد البيانات
                    </span>
                  </Button>
                </label>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                      onClick={resetForm}
                    >
                      <Plus className="h-4 w-4" />
                      حجز جديد
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]" dir="rtl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingBooking ? 'تعديل الحجز' : 'إضافة حجز جديد'}
                      </DialogTitle>
                      <DialogDescription>
                        قم بإدخال تفاصيل الحجز في النموذج أدناه
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="date" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            تاريخ الحجز *
                          </Label>
                          <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => handleInputChange('date', e.target.value)}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="phone" className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            رقم الهاتف *
                          </Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="05xxxxxxxx"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="location" className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          موقع الحجز *
                        </Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="اسم المكان أو العنوان"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="totalPrice">سعر الاتفاق (ر.س)</Label>
                          <Input
                            id="totalPrice"
                            type="number"
                            value={formData.totalPrice}
                            onChange={(e) => handleInputChange('totalPrice', e.target.value)}
                            placeholder="0"
                            min="0"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="paidAmount">المبلغ المدفوع (ر.س)</Label>
                          <Input
                            id="paidAmount"
                            type="number"
                            value={formData.paidAmount}
                            onChange={(e) => handleInputChange('paidAmount', e.target.value)}
                            placeholder="0"
                            min="0"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="details" className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          تفاصيل الحجز
                        </Label>
                        <Textarea
                          id="details"
                          value={formData.details}
                          onChange={(e) => handleInputChange('details', e.target.value)}
                          placeholder="أي تفاصيل إضافية للحجز..."
                          rows={3}
                        />
                      </div>

                      {formData.totalPrice && formData.paidAmount && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-800">
                            <strong>المبلغ المتبقي: </strong>
                            {calculateRemainingAmount(
                              parseFloat(formData.totalPrice) || 0,
                              parseFloat(formData.paidAmount) || 0
                            ).toLocaleString()} ر.س
                          </p>
                        </div>
                      )}
                    </div>

                    <DialogFooter className="gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsDialogOpen(false)}
                      >
                        إلغاء
                      </Button>
                      <Button 
                        onClick={handleSubmit}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {editingBooking ? 'تحديث الحجز' : 'إضافة الحجز'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* جدول الحجوزات */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              قائمة الحجوزات ({filteredBookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Calendar className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'لا توجد نتائج' : 'لا توجد حجوزات'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm ? 'جرب مصطلح بحث آخر' : 'ابدأ بإضافة حجز جديد'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">الموقع</TableHead>
                      <TableHead className="text-right">رقم الهاتف</TableHead>
                      <TableHead className="text-right">سعر الاتفاق</TableHead>
                      <TableHead className="text-right">المبلغ المدفوع</TableHead>
                      <TableHead className="text-right">المبلغ المتبقي</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id} className="hover:bg-blue-50/50 transition-colors">
                        <TableCell>
                          {formatDateToGregorian(booking.date)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {booking.location}
                        </TableCell>
                        <TableCell>
                          <a 
                            href={`tel:${booking.phone}`}
                            className="text-blue-600 hover:underline"
                          >
                            {booking.phone}
                          </a>
                        </TableCell>
                        <TableCell>
                          {booking.totalPrice.toLocaleString()} ر.س
                        </TableCell>
                        <TableCell>
                          {booking.paidAmount.toLocaleString()} ر.س
                        </TableCell>
                        <TableCell>
                          <span className={booking.remainingAmount > 0 ? 'text-orange-600 font-medium' : 'text-green-600'}>
                            {booking.remainingAmount.toLocaleString()} ر.س
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={booking.remainingAmount > 0 ? "destructive" : "secondary"}
                            className={booking.remainingAmount > 0 ? 
                              'bg-orange-100 text-orange-800 hover:bg-orange-200' : 
                              'bg-green-100 text-green-800 hover:bg-green-200'
                            }
                          >
                            {booking.remainingAmount > 0 ? 'مستحق' : 'مكتمل'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(booking)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent dir="rtl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    سيتم حذف هذا الحجز نهائياً ولا يمكن التراجع عن هذا الإجراء.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(booking.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    حذف
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
      
      <Toaster position="top-center" richColors />
    </div>
  );
}