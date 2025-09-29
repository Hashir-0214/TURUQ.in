// src/app/admin/users/page.js

'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import {
    PlusCircle,
    Trash2,
    Edit,
    User,
    LoaderCircle,
} from 'lucide-react';
import Table from '@/components/admin/ui/Table';
import Modal from '@/components/admin/ui/modal/Modal';
import { useNotification } from '@/components/ui/notification/NotificationProvider';
import { AddUserForm } from '@/components/admin/users/AddUserForm';
import { EditUserForm } from '@/components/admin/users/EditUserForm';

const fetchUsers = async (addNotification) => {
    const API_KEY_TO_SEND = process.env.NEXT_PUBLIC_API_KEY;

    if (!API_KEY_TO_SEND) {
        const msg = 'API Key is missing. Check your .env.local file.';
        console.error(msg);
        addNotification('error', msg);
        return [];
    }

    try {
        const res = await fetch('/api/admin/users', {
            method: 'GET',
            headers: {
                'x-api-key': API_KEY_TO_SEND,
                'Content-Type': 'application/json',
            }
        });

        if (!res.ok) {
            // Throw an error with the status for better debugging
            const errorData = await res.json();
            throw new Error(errorData.message || `Failed to fetch users: ${res.status}`);
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Fetch users error:", error);
        if (addNotification) {
            addNotification('error', error.message || 'Error loading users.');
        }

        return [];
    }
}

const columns = [
    {
        key: 'name',
        header: 'Name',
        sortable: true,
        render: (row) => (
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-black/50">
                    {row.avatar ? (
                        <Image
                            src={row.avatar}
                            alt={row.name}
                            width={40}
                            height={40}
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 grid place-items-center">
                            <User className="w-5 h-5 text-gray-500" />
                        </div>
                    )}
                </div>
                <span className="font-bold">{row.name}</span>
            </div>
        ),
    },
    {
        key: 'username',
        header: 'Username',
        sortable: true,
        className: 'font-mono text-gray-600',
    },
    {
        key: 'email',
        header: 'Email',
        sortable: true,
    },
    {
        key: 'phone',
        header: 'Phone',
        sortable: false,
        render: (row) => row.phone || '-',
        className: 'text-gray-600',
    },
    {
        key: 'created_at',
        header: 'Joined At',
        sortable: true,
        render: (row) => new Date(row.created_at).toLocaleDateString(),
    },
    {
        key: 'actions',
        header: 'Actions',
        sortable: false,
        render: (row, { handleEdit, openDeleteModal }) => (
            <div className="flex gap-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent row click
                        handleEdit(row._id);
                    }}
                    className="p-1 bg-green-600 text-white border border-black rounded text-xs hover:bg-green-700 transition-colors"
                    aria-label="Edit"
                >
                    <Edit className="w-4 h-4" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        // FIX: Call the new function to open the confirmation modal
                        openDeleteModal(row._id, row.name);
                    }}
                    className="p-1 bg-red-600 text-white border border-black rounded text-xs hover:bg-red-700 transition-colors"
                    aria-label="Delete"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        ),
    },
];

export default function UsersPage() {
    const { addNotification } = useNotification();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddUsersModalOpen, setIsAddUsersModalOpen] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isEditUsersModalOpen, setIsEditUsersModalOpen] = useState(false);
    const [usersToEditId, setUsersToEditId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [usersToDelete, setUsersToDelete] = useState({ id: null, name: '' });

    const loadUsers = useCallback(async () => {
        setLoading(true);
        setHasError(false); // Reset error status on new attempt
        try {
            const data = await fetchUsers(addNotification);
            setUsers(data);

            if (data.length === 0 && !process.env.NEXT_PUBLIC_API_KEY) {
                setHasError(true);
            }
        } catch (error) {
            setHasError(true); // Set error flag on failed fetch
        } finally {
            setLoading(false);
        }
    }, [addNotification]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    if (loading && users.length === 0 && !hasError) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoaderCircle className="w-10 h-10 animate-spin text-red-600" />
            </div>
        );
    }

    if (hasError && users.length === 0 && !loading) {
        console.log('Users page rendered with critical error.');
    }

    const handleUserAdded = (newUser) => {
        setUsers((prev) => [...prev, newUser]);
    };

    const handleUserUpdated = (updatedUser) => {
        setUsers((prev) =>
            prev.map(user =>
                user._id === updatedUser._id ? updatedUser : user
            )
        );
        setIsEditUsersModalOpen(false);
        addNotification('success', `User "${updatedUser.name}" updated successfully!`);
    };

    const handleEdit = (id) => {
        setUsersToEditId(id);
        setIsEditUsersModalOpen(true);
    };

    const openDeleteModal = (id, name) => {
        setUsersToDelete({ id, name });
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        const id = usersToDelete.id;
        if (!id) return;

        setIsDeleteModalOpen(false);

        const API_KEY_TO_SEND = process.env.NEXT_PUBLIC_API_KEY;

        try {
            const res = await fetch('/api/admin/users', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY_TO_SEND,
                },
                body: JSON.stringify({ id }),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || `Failed to delete user (Status: ${res.status})`);
            }

            setUsers((prev) => prev.filter((a) => a._id !== id));
            addNotification('success', result.message || `User deleted successfully.`);
        } catch (error) {
            console.error('Delete Error:', error.message);
            addNotification('error', error.message || 'An error occurred during deletion.');
        } finally {
            setUsersToDelete({ id: null, name: '' });
        }
    };

    const handleRowClick = (row) => {
        console.log('User row clicked:', row.name);
    };

    if (loading && users.length === 0) {
        return (
            <div className="flex justify-center items-center h-[500px]">
                <LoaderCircle className="w-10 h-10 animate-spin text-red-600" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 pb-6 shadow-md rounded-xl">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 uppercase">Users Management</h1>

            <div className='flex gap-10'>
                <main className="flex-1">
                    <div className="flex items-center justify-end mb-4">
                        <button
                            onClick={() => setIsAddUsersModalOpen(true)}
                            className="flex items-center text-sm px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors cursor-pointer"
                        >
                            <PlusCircle className="w-5 h-5 mr-2" />
                            Add User
                        </button>
                    </div>

                    <Table
                        data={users}
                        columns={columns}
                        loading={loading}
                        onReload={loadUsers}
                        handlers={{ handleEdit, openDeleteModal }}
                        searchKeys={['name', 'email', 'slug']}
                        selectable={false}
                        bulkActions={[]}
                        onBulkAction={() => { }}
                        onSelectionChange={() => { }}
                        onRowClick={handleRowClick}
                        searchPlaceholder="Search by name, email, or slug..."
                    />
                </main>
            </div>

            <Modal
                isOpen={isAddUsersModalOpen}
                onClose={() => setIsAddUsersModalOpen(false)}
                title="Add New User"
            >
                <AddUserForm
                    onUserAdded={(newUser) => {
                        handleUserAdded(newUser);
                        setIsAddUsersModalOpen(false);
                        addNotification('success', 'User added successfully!');
                    }}
                    onCancel={() => setIsAddUsersModalOpen(false)}
                />
            </Modal>

            <Modal
                isOpen={isEditUsersModalOpen}
                onClose={() => setIsEditUsersModalOpen(false)}
                title="Edit User"
            >
                {isEditUsersModalOpen && usersToEditId && (
                    <EditUserForm
                        userId={usersToEditId}
                        onUserUpdated={handleUserUpdated}
                        onCancel={() => setIsEditUsersModalOpen(false)}
                    />
                )}
            </Modal>

            <Modal isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Deletion"
            >
                <div className="p-4">
                    <p className="text-gray-700 mb-4">
                        Are you sure you want to delete user <span className="font-bold text-red-600">&quot;{usersToDelete.name}&quot;</span>?
                        This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="px-4 py-2 bg-gray-300 text-gray-800 mb-6 uppercase"
                        >
                            Cancel
                        </ button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>


    )
}