import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProducts, Product } from "@/hooks/useProducts";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { CategoryManager } from "@/components/CategoryManager";
import { formatCurrency } from "@/lib/utils";
import { Plus, Edit, Trash2, Package, TrendingUp, AlertTriangle, ShoppingCart, BarChart3, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Admin = () => {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts();
  const { transactions } = useTransactions();
  const { categories, loading: categoriesLoading } = useCategories();
  const { toast } = useToast();

  // Debug logging to check categories
  console.log('Categories in Admin:', categories);
  console.log('Categories loading:', categoriesLoading);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    purchase_price: "",
    current_stock: "",
    min_stock: "",
    location: "",
    barcode: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      price: "",
      purchase_price: "",
      current_stock: "",
      min_stock: "",
      location: "",
      barcode: "",
    });
  };

  // Stock chart data
  const stockChartData = useMemo(() => {
    const stockLevels = products.map(product => ({
      name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
      current: product.current_stock,
      minimum: product.min_stock,
      status: product.current_stock === 0 ? 'Habis' : 
              product.current_stock <= product.min_stock ? 'Rendah' : 'Aman'
    })).slice(0, 10); // Show top 10 products

    return stockLevels;
  }, [products]);

  // Stock status distribution
  const stockStatusData = useMemo(() => {
    const available = products.filter(p => p.current_stock > p.min_stock).length;
    const low = products.filter(p => p.current_stock > 0 && p.current_stock <= p.min_stock).length;
    const out = products.filter(p => p.current_stock === 0).length;

    return [
      { name: 'Stok Aman', value: available, color: '#10b981' },
      { name: 'Stok Rendah', value: low, color: '#f59e0b' },
      { name: 'Habis', value: out, color: '#ef4444' }
    ].filter(item => item.value > 0);
  }, [products]);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.price || !formData.purchase_price) {
      toast({
        title: "Error",
        description: "Nama, kategori, harga beli, dan harga jual wajib diisi",
        variant: "destructive",
      });
      return;
    }

    const productData = {
      name: formData.name,
      category: formData.category,
      price: parseInt(formData.price),
      purchase_price: parseInt(formData.purchase_price),
      current_stock: parseInt(formData.current_stock) || 0,
      min_stock: parseInt(formData.min_stock) || 5,
      location: formData.location || null,
      barcode: formData.barcode || null,
    };

    if (editingProduct) {
      const result = await updateProduct(editingProduct.id, productData);
      if (result.success) {
        setIsEditDialogOpen(false);
        setEditingProduct(null);
        resetForm();
      }
    } else {
      const result = await addProduct(productData);
      if (result.success) {
        setIsAddDialogOpen(false);
        resetForm();
      }
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      purchase_price: product.purchase_price.toString(),
      current_stock: product.current_stock.toString(),
      min_stock: product.min_stock.toString(),
      location: product.location || "",
      barcode: product.barcode || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (product: Product) => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk "${product.name}"?`)) {
      await deleteProduct(product.id);
    }
  };

  const getStockStatus = (currentStock: number, minStock: number) => {
    if (currentStock === 0) return { status: "Habis", variant: "destructive" as const };
    if (currentStock <= minStock) return { status: "Stok Rendah", variant: "secondary" as const };
    return { status: "Tersedia", variant: "default" as const };
  };

  const stats = {
    totalProducts: products.length,
    lowStock: products.filter(p => p.current_stock <= p.min_stock && p.current_stock > 0).length,
    outOfStock: products.filter(p => p.current_stock === 0).length,
    totalTransactions: transactions.length,
  };

  const renderProductForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Produk *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Masukkan nama produk"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Kategori *</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>
                  Belum ada kategori - Buat kategori di tab Master Kategori
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {categories.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Belum ada kategori tersedia. Silakan buat kategori terlebih dahulu di tab "Master Kategori".
            </p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="purchase_price">Harga Beli *</Label>
          <Input
            id="purchase_price"
            type="number"
            value={formData.purchase_price}
            onChange={(e) => setFormData(prev => ({ ...prev, purchase_price: e.target.value }))}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Harga Jual *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            placeholder="0"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="current_stock">Stok Saat Ini</Label>
          <Input
            id="current_stock"
            type="number"
            value={formData.current_stock}
            onChange={(e) => setFormData(prev => ({ ...prev, current_stock: e.target.value }))}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="min_stock">Minimum Stok</Label>
          <Input
            id="min_stock"
            type="number"
            value={formData.min_stock}
            onChange={(e) => setFormData(prev => ({ ...prev, min_stock: e.target.value }))}
            placeholder="5"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Lokasi</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="Rak A1"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="barcode">Barcode</Label>
          <Input
            id="barcode"
            value={formData.barcode}
            onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
            placeholder="1234567890123"
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="submit">
          {editingProduct ? "Perbarui Produk" : "Tambah Produk"}
        </Button>
      </DialogFooter>
    </form>
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground animate-pulse" />
            <p className="mt-2 text-muted-foreground">Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Dashboard Admin
          </h1>
          <p className="text-muted-foreground mt-2">
            Kelola produk dan pantau inventori
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Produk
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tambah Produk Baru</DialogTitle>
              <DialogDescription>
                Masukkan detail produk yang akan ditambahkan ke inventori
              </DialogDescription>
            </DialogHeader>
            {renderProductForm()}
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Rendah</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.lowStock}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Habis</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.outOfStock}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Stock Levels Chart */}
        <Card className="backdrop-blur-sm bg-card/95 border-0 shadow-xl rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-xl bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              Level Stok Produk
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stockChartData.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Belum ada data produk untuk menampilkan grafik
                </p>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stockChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#64748b"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="#64748b"
                      fontSize={12}
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        `${value} unit`,
                        name === 'current' ? 'Stok Saat Ini' : 'Stok Minimum'
                      ]}
                      labelStyle={{ color: '#1e293b' }}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="current" 
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                      name="current"
                    />
                    <Bar 
                      dataKey="minimum" 
                      fill="#f59e0b"
                      radius={[4, 4, 0, 0]}
                      name="minimum"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock Status Distribution */}
        <Card className="backdrop-blur-sm bg-card/95 border-0 shadow-xl rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-xl bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              Distribusi Status Stok
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stockStatusData.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Belum ada data untuk menampilkan distribusi stok
                </p>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stockStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stockStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} produk`, 'Jumlah']}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products">Manajemen Produk</TabsTrigger>
          <TabsTrigger value="categories">Master Kategori</TabsTrigger>
          <TabsTrigger value="transactions">Riwayat Transaksi</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Produk</CardTitle>
              <CardDescription>
                Kelola semua produk dalam inventori
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Harga Beli</TableHead>
                    <TableHead>Harga Jual</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const stockStatus = getStockStatus(product.current_stock, product.min_stock);
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{formatCurrency(product.purchase_price)}</TableCell>
                        <TableCell>{formatCurrency(product.price)}</TableCell>
                        <TableCell>{product.current_stock}</TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.variant}>
                            {stockStatus.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{product.location || "-"}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(product)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <CategoryManager />
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Transaksi</CardTitle>
              <CardDescription>
                Lihat semua transaksi yang telah dilakukan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Struk</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Kasir</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Pembayaran</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.receipt_number}</TableCell>
                      <TableCell>
                        {new Date(transaction.created_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>{transaction.cashier_name}</TableCell>
                      <TableCell>{formatCurrency(transaction.grand_total)}</TableCell>
                      <TableCell className="capitalize">{transaction.payment_method}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Produk</DialogTitle>
            <DialogDescription>
              Perbarui detail produk
            </DialogDescription>
          </DialogHeader>
          {renderProductForm()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;