// src/app/admin/webzines/page.js
'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import {
  PlusCircle,
  Trash2,
  Edit,
  BookOpen, // Icone pour Webzine par défaut
  LoaderCircle,
} from 'lucide-react';
import Table from '@/components/admin/ui/Table';
import Modal from '@/components/admin/ui/modal/Modal';
import { useNotification } from '@/components/ui/notification/NotificationProvider';
import { AddWebzineForm } from '@/components/admin/webzines/AddWebzineForm';
import { EditWebzineForm } from '@/components/admin/webzines/EditWebzineForm';

// --- API FETCH FUNCTION ---
const fetchWebzines = async (addNotification) => {
  const API_KEY_TO_SEND = process.env.NEXT_PUBLIC_API_KEY;

  if (!API_KEY_TO_SEND) {
    const msg = 'API Key is missing. Check your .env.local file.';
    console.error(msg);
    if (addNotification) addNotification('error', msg);
    return [];
  }

  try {
    const res = await fetch('/api/admin/webzines', {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY_TO_SEND,
        'Content-Type': 'application/json',
      }
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || `Failed to fetch webzines: ${res.status}`);
    }

    const jsonData = await res.json();
    
    // Supporte à la fois le retour direct array ou { data: [] }
    if (Array.isArray(jsonData)) return jsonData;
    return Array.isArray(jsonData.data) ? jsonData.data : [];

  } catch (error) {
    console.error("Fetch webzines error:", error);
    if (addNotification) {
      addNotification('error', error.message || 'Error loading webzines.');
    }
    return [];
  }
}

// --- TABLE COLUMNS CONFIG ---
const columns = [
  {
    key: 'name',
    header: 'Webzine Name',
    sortable: true,
    render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-14 rounded overflow-hidden border border-black/20 bg-gray-100 flex-shrink-0">
          {row.cover_image ? (
            <Image
              loader={({ src }) => src}
              src={row.cover_image}
              alt={row.name}
              width={40}
              height={56}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full grid place-items-center">
              <BookOpen className="w-5 h-5 text-gray-400" />
            </div>
          )}
        </div>
        <div>
           <span className="font-bold block">{row.name}</span>
           <span className="text-xs text-gray-500">{row.slug}</span>
        </div>
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (row) => {
        let colorClass = "bg-gray-100 text-gray-800";
        if (row.status === 'published') colorClass = "bg-green-100 text-green-800 border-green-200";
        if (row.status === 'archived') colorClass = "bg-yellow-100 text-yellow-800 border-yellow-200";
        
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${colorClass} capitalize`}>
                {row.status}
            </span>
        );
    }
  },
  {
    key: 'published_at',
    header: 'Published Date',
    sortable: true,
    render: (row) => row.published_at ? new Date(row.published_at).toLocaleDateString() : '-',
    className: 'text-gray-600 text-sm',
  },
  {
    key: 'actions',
    header: 'Actions',
    sortable: false,
    render: (row, { handleEdit, openDeleteModal }) => (
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
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

export default function WebzinesPage() {
  const { addNotification } = useNotification();
  const [webzines, setWebzines] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [itemToEditId, setItemToEditId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState({ id: null, name: '' });

  const loadWebzines = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchWebzines(addNotification);
      setWebzines(data);
    } catch (error) {
      // Error handled in fetchWebzines
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    loadWebzines();
  }, [loadWebzines]);

  /* ------------- Handlers ------------- */
  const handleWebzineAdded = (newItem) => {
    setWebzines((prev) => [newItem, ...prev]); // Add to top
    setIsAddModalOpen(false);
    addNotification('success', 'Webzine added successfully!');
  };

  const handleWebzineUpdated = (updatedItem) => {
    setWebzines((prev) =>
      prev.map(item => item._id === updatedItem._id ? updatedItem : item)
    );
    setIsEditModalOpen(false);
    addNotification('success', `Webzine "${updatedItem.name}" updated successfully!`);
  };

  const handleEdit = (id) => {
    setItemToEditId(id);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (id, name) => {
    setItemToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    const id = itemToDelete.id;
    if (!id) return;

    setIsDeleteModalOpen(false);
    const API_KEY_TO_SEND = process.env.NEXT_PUBLIC_API_KEY;

    try {
      const res = await fetch('/api/admin/webzines', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY_TO_SEND,
        },
        body: JSON.stringify({ id }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || `Failed to delete webzine`);
      }

      setWebzines((prev) => prev.filter((a) => a._id !== id));
      addNotification('success', result.message || `Webzine deleted successfully.`);
    } catch (error) {
      console.error('Delete Error:', error.message);
      addNotification('error', error.message || 'An error occurred during deletion.');
    } finally {
      setItemToDelete({ id: null, name: '' });
    }
  };

  /* ------------- Render ------------- */
  if (loading && webzines.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="w-10 h-10 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 pb-6 shadow-md rounded-xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 uppercase">Webzines Management</h1>

      <div className="flex gap-10">
        <main className="flex-1">
          {/* Action Button: New Webzine */}
          <div className="flex items-center justify-end mb-4">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center text-sm px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Add Webzine
            </button>
          </div>

          {/* Table component */}
          <Table
            data={webzines}
            columns={columns}
            loading={loading}
            onReload={loadWebzines}
            handlers={{ handleEdit, openDeleteModal }}
            searchKeys={['name', 'slug']}
            selectable={false}
            searchPlaceholder="Search by name or slug..."
          />
        </main>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Issue"
      >
        <AddWebzineForm
          onWebzineAdded={handleWebzineAdded}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Issue"
      >
        {isEditModalOpen && itemToEditId && (
          <EditWebzineForm
            webzineId={itemToEditId}
            onWebzineUpdated={handleWebzineUpdated}
            onCancel={() => setIsEditModalOpen(false)}
          />
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="p-4">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete <span className="font-bold text-red-600">&quot;{itemToDelete.name}&quot;</span>?
            This will also unlink any posts associated with this issue.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
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
  );
}