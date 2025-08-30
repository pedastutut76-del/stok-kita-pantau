import { useState } from "react";
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
import { formatCurrency } from "@/lib/utils";
import { Plus, Edit, Trash2, Package, TrendingUp, AlertTriangle, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts();
  const { transactions } = useTransactions();
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
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
      current_stock: "",
      min_stock: "",
      location: "",
      barcode: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.price) {
      toast({
        title: "Error",
        description: "Nama, kategori, dan harga wajib diisi",
        variant: "destructive",
      });
      return;
    }

    const productData = {
      name: formData.name,
      category: formData.category,
      price: parseInt(formData.price),
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

  const ProductForm = () => (
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
              <SelectItem value="Makanan">Makanan</SelectItem>
              <SelectItem value="Minuman">Minuman</SelectItem>
              <SelectItem value="Kebersihan">Kebersihan</SelectItem>
              <SelectItem value="Elektronik">Elektronik</SelectItem>
              <SelectItem value="Pakaian">Pakaian</SelectItem>
              <SelectItem value="Alat Tulis">Alat Tulis</SelectItem>
              <SelectItem value="Lainnya">Lainnya</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Harga *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            placeholder="0"
          />
        </div>
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
            <ProductForm />
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

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products">Manajemen Produk</TabsTrigger>
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
                    <TableHead>Harga</TableHead>
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
          <ProductForm />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;