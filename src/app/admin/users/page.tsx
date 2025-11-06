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
import { Users, UserPlus, Mail, Phone, MapPin, Calendar } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  phone?: string;
  address?: string;
  createdAt: string;
  lastLogin?: string;
}

const UsersPage: React.FC = () => {
  const [users] = useState<User[]>([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin',
      status: 'active',
      phone: '+62 812-3456-7890',
      address: 'Jakarta, Indonesia',
      createdAt: '2024-01-15',
      lastLogin: '2024-11-06'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Customer',
      status: 'active',
      phone: '+62 813-7890-1234',
      address: 'Bandung, Indonesia',
      createdAt: '2024-02-20',
      lastLogin: '2024-11-05'
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      role: 'Reseller',
      status: 'inactive',
      phone: '+62 814-5678-9012',
      address: 'Surabaya, Indonesia',
      createdAt: '2024-03-10',
      lastLogin: '2024-10-28'
    },
  ]);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsCreateMode(true);
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsCreateMode(false);
    setIsDialogOpen(true);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsCreateMode(false);
    setIsDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      console.log('Delete user:', user.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (value: string, user: User) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (value: string) => (
        <StatusBadge status={value} variant="info" />
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
      key: 'phone',
      label: 'Contact',
      className: 'hidden md:table-cell',
      render: (value: string, user: User) => (
        <div className="space-y-1">
          {user.phone && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Phone className="w-3 h-3" />
              {user.phone}
            </div>
          )}
          {user.address && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="w-3 h-3" />
              {user.address}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Joined',
      className: 'hidden lg:table-cell',
      render: (value: string, user: User) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Calendar className="w-3 h-3" />
            {formatDate(value)}
          </div>
          {user.lastLogin && (
            <div className="text-xs text-gray-500">
              Last: {formatDate(user.lastLogin)}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'w-12',
      render: (_, user: User) => (
        <ActionDropdown
          actions={createCommonActions.crud(
            () => handleViewUser(user),
            () => handleEditUser(user),
            () => handleDeleteUser(user)
          )}
        />
      )
    },
  ];

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    user.email.toLowerCase().includes(searchValue.toLowerCase()) ||
    user.role.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Users Management</h1>
            <p className="text-gray-600 mt-1">Manage system users and their permissions</p>
          </div>
          <Button onClick={handleCreateUser} className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Add User
          </Button>
        </div>

        {/* Users Table */}
        <AdminCard 
          title="All Users"
          description={`${filteredUsers.length} users found`}
        >
          <AdminTable
            columns={columns}
            data={filteredUsers}
            searchable
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            searchPlaceholder="Search users by name, email, or role..."
            filterable
            exportable
            refreshable
            emptyMessage="No users found"
          />
        </AdminCard>

        {/* User Dialog */}
        <AdminDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={isCreateMode ? 'Add New User' : selectedUser ? `Edit ${selectedUser.name}` : 'User Details'}
          description={isCreateMode ? 'Create a new user account' : 'View and edit user information'}
          size="lg"
          footer={
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button>
                {isCreateMode ? 'Create User' : 'Save Changes'}
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            <FormGrid columns={2}>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  defaultValue={selectedUser?.name || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  defaultValue={selectedUser?.email || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select defaultValue={selectedUser?.role || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Customer">Customer</SelectItem>
                    <SelectItem value="Reseller">Reseller</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue={selectedUser?.status || 'active'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="Enter phone number"
                  defaultValue={selectedUser?.phone || ''}
                />
              </div>
            </FormGrid>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Enter full address"
                defaultValue={selectedUser?.address || ''}
                rows={3}
              />
            </div>
          </div>
        </AdminDialog>
      </div>
    </div>
  );
};

export default UsersPage;