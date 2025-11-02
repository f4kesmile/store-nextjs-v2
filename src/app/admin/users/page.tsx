// src/app/admin/users/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface User {
  id: number;
  username: string;
  email: string;
  roleId: number;
  role: {
    id: number;
    name: string;
  };
  createdAt: string;
}

interface Role {
  id: number;
  name: string;
}

export default function UsersManagement() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    roleId: "",
  });

  useEffect(() => {
    if (session?.user.role !== "DEVELOPER") {
      window.location.href = "/admin";
      return;
    }
    fetchUsers();
    fetchRoles();
  }, [session]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/roles");
      const data = await res.json();
      setRoles(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users";
      const method = editingUser ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchUsers();
        setShowModal(false);
        resetForm();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save user");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save user");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus user ini?")) return;

    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      roleId: user.roleId.toString(),
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      username: "",
      email: "",
      password: "",
      roleId: "",
    });
  };

  if (session?.user.role !== "DEVELOPER") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manajemen Users</h1>
          <p className="text-gray-600 mt-1">
            Kelola pengguna dan hak akses mereka
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
        >
          ➕ Tambah User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                Username
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                Email
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                Role
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                Dibuat
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{user.username}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold ${
                      user.role.name === "DEVELOPER"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {user.role.name}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600 text-sm">
                  {new Date(user.createdAt).toLocaleDateString("id-ID")}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-6">
              {editingUser ? "Edit User" : "Tambah User"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full border rounded-lg p-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full border rounded-lg p-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Password {editingUser && "(Kosongkan jika tidak diubah)"}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full border rounded-lg p-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  required
                  value={formData.roleId}
                  onChange={(e) =>
                    setFormData({ ...formData, roleId: e.target.value })
                  }
                  className="w-full border rounded-lg p-3"
                >
                  <option value="">Pilih Role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? "Saving..." : editingUser ? "Update" : "Simpan"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
