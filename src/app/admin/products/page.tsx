'use client';

import React, { useState } from 'react';
import AdminCard from '../../../components/admin/shared/AdminCard';
import AdminDialog from '../../../components/admin/shared/AdminDialog';
import AdminTable from '../../../components/admin/shared/AdminTable';
import { StatusBadge, ActionDropdown, FormGrid, createCommonActions } from '../../../components/admin/shared/AdminComponents';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { Package, Plus, DollarSign, Package2 } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  description?: string;
  createdAt: string;
}

const ProductsPage: React.FC = () => {
  const [products] = useState<Product[]>([
    {
      id: 1,
      name: 'Wireless Headphones',
      sku: 'WH-001',
      category: 'Electronics',
      price: 299000,
      stock: 45,
      status: 'active',
      description: 'High-quality wireless headphones with noise cancellation',
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'Gaming Mouse',
      sku: 'GM-002',
      category: 'Electronics',
      price: 150000,
      stock: 0,
      status: 'out_of_stock',
      description: 'Professional gaming mouse with RGB lighting',
      createdAt: '2024-02-20'
    },
    {
      id: 3,
      name: 'Coffee Mug',
      sku: 'CM-003',
      category: 'Home & Garden',
      price: 45000,
      stock: 120,
      status: 'active',
      description: 'Ceramic coffee mug with elegant design',
      createdAt: '2024-03-10'
    },
  ]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setIsCreateMode(true);
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsCreateMode(false);
    setIsDialogOpen(true);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsCreateMode(false);
    setIsDialogOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    if (confirm(`Are you sure you want to delete ${product.name}?`)) {
      console.log('Delete product:', product.id);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return 'out_of_stock';
    if (stock < 10) return 'low_stock';
    return 'in_stock';
  };

  const columns = [
    {
      key: 'name',
      label: 'Product',
      render: (value: string, product: Product) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{product.sku}</p>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (value: string) => (
        <StatusBadge status={value} variant="info" />
      )
    },
    {
      key: 'price',
      label: 'Price',
      render: (value: number) => (
        <div className="flex items-center gap-1 font-medium text-gray-900">
          <DollarSign className="w-4 h-4 text-green-600" />
          {formatCurrency(value)}
        </div>
      )
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <Package2 className="w-4 h-4 text-gray-500" />
          <span className="font-medium">{value}</span>
          <StatusBadge status={getStockStatus(value)} />
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <StatusBadge status={value} />
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      className: 'hidden lg:table-cell',
      render: (value: string) => (
        <span className="text-sm text-gray-600">{formatDate(value)}</span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'w-12',
      render: (_: unknown, product: Product) => (
        <ActionDropdown
          actions={createCommonActions.crud(
            () => handleViewProduct(product),
            () => handleEditProduct(product),
            () => handleDeleteProduct(product)
          )}
        />
      )
    },
  ];

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchValue.toLowerCase()) ||
    product.category.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products Management</h1>
            <p className="text-gray-600 mt-1">Manage your product inventory and pricing</p>
          </div>
          <Button onClick={handleCreateProduct} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>

        {/* Products Table */}
        <AdminCard 
          title="All Products"
          description={`${filteredProducts.length} products found`}
        >
          <AdminTable
            columns={columns}
            data={filteredProducts}
            searchable
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            searchPlaceholder="Search products by name, SKU, or category..."
            filterable
            exportable
            refreshable
            emptyMessage="No products found"
          />
        </AdminCard>

        {/* Product Dialog */}
        <AdminDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={isCreateMode ? 'Add New Product' : selectedProduct ? `Edit ${selectedProduct.name}` : 'Product Details'}
          description={isCreateMode ? 'Create a new product in your inventory' : 'View and edit product information'}
          size="xl"
          footer={
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button>
                {isCreateMode ? 'Create Product' : 'Save Changes'}
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            <FormGrid columns={2}>
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  placeholder="Enter product name"
                  defaultValue={selectedProduct?.name || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  placeholder="Enter SKU code"
                  defaultValue={selectedProduct?.sku || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={selectedProduct?.category || ''} onValueChange={() => {}}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Clothing">Clothing</SelectItem>
                    <SelectItem value="Home & Garden">Home & Garden</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Books">Books</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={selectedProduct?.status || 'active'} onValueChange={() => {}}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (IDR)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Enter price"
                  defaultValue={selectedProduct?.price || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="Enter stock quantity"
                  defaultValue={selectedProduct?.stock || ''}
                />
              </div>
            </FormGrid>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter product description"
                defaultValue={selectedProduct?.description || ''}
                rows={4}
              />
            </div>
          </div>
        </AdminDialog>
      </div>
    </div>
  );
};

export default ProductsPage;
