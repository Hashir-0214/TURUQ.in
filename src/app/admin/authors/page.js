// src/app/admin/authors/page.js
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
import { AddAuthorForm } from '@/components/admin/authors/AddAuthorForm';
import { EditAuthorForm } from '@/components/admin/authors/EditAuthorForm';

const fetchAuthors = async (addNotification) => {
  const API_KEY_TO_SEND = process.env.NEXT_PUBLIC_API_KEY;

  if (!API_KEY_TO_SEND) {
    const msg = 'API Key is missing. Check your .env.local file.';
    console.error(msg);
    addNotification('error', msg);
    return [];
  }

  try {
    const res = await fetch('/api/admin/authors', {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY_TO_SEND,
        'Content-Type': 'application/json',
      }
    });

    if (!res.ok) {
      // Throw an error with the status for better debugging
      const errorData = await res.json();
      throw new Error(errorData.message || `Failed to fetch authors: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Fetch authors error:", error);
    if (addNotification) {
      addNotification('error', error.message || 'Error loading authors.');
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
    key: 'slug',
    header: 'Slug',
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

export default function AuthorsPage() {
  const { addNotification } = useNotification();
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddAuthorModalOpen, setIsAddAuthorModalOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isEditAuthorModalOpen, setIsEditAuthorModalOpen] = useState(false);
  const [authorToEditId, setAuthorToEditId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [authorToDelete, setAuthorToDelete] = useState({ id: null, name: '' });

  const loadAuthors = useCallback(async () => {
    setLoading(true);
    setHasError(false); // Reset error status on new attempt
    try {
      const data = await fetchAuthors(addNotification);
      setAuthors(data);
      // Check for empty array returned on error inside fetchAuthors
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
    loadAuthors();
  }, [loadAuthors]);

  if (loading && authors.length === 0 && !hasError) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="w-10 h-10 animate-spin text-red-600" />
      </div>
    );
  }

  // Render error state if needed, but the notification handles most of the feedback
  if (hasError && authors.length === 0 && !loading) {
    // Optionally show a permanent error message on the page
    console.log('Authors page rendered with critical error.');
  }
  /* ------------- Handlers ------------- */
  const handleAuthorAdded = (newAuthor) => {
    setAuthors((prev) => [...prev, newAuthor]);
  };

  const handleAuthorUpdated = (updatedAuthor) => {
    // Replace the old author object with the new one in the state array
    setAuthors((prev) =>
      prev.map(author =>
        author._id === updatedAuthor._id ? updatedAuthor : author
      )
    );
    setIsEditAuthorModalOpen(false); // Close the modal
    addNotification('success', `Author "${updatedAuthor.name}" updated successfully!`);
  };

  const handleEdit = (id) => {
    setAuthorToEditId(id);
    setIsEditAuthorModalOpen(true);
  };

  const openDeleteModal = (id, name) => {
    setAuthorToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    const id = authorToDelete.id;
    if (!id) return;

    // Close the modal immediately after confirmation to prevent double submission
    setIsDeleteModalOpen(false);

    const API_KEY_TO_SEND = process.env.NEXT_PUBLIC_API_KEY;

    try {
      const res = await fetch('/api/admin/authors', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY_TO_SEND,
        },
        body: JSON.stringify({ id }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || `Failed to delete author (Status: ${res.status})`);
      }

      setAuthors((prev) => prev.filter((a) => a._id !== id));
      addNotification('success', result.message || `Author deleted successfully.`);
    } catch (error) {
      console.error('Delete Error:', error.message);
      addNotification('error', error.message || 'An error occurred during deletion.');
    } finally {
      setAuthorToDelete({ id: null, name: '' });
    }
  };

  const handleRowClick = (row) => {
    console.log('Author row clicked:', row.name);
  };

  /* ------------- Render ------------- */
  if (loading && authors.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="w-10 h-10 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 pb-6 shadow-md rounded-xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 uppercase">Authors Management</h1>

      <div className="flex gap-10">
        <main className="flex-1">
          {/* Action Button: New Author */}
          <div className="flex items-center justify-end mb-4">
            <button
              onClick={() => setIsAddAuthorModalOpen(true)} // Open modal on click
              className="flex items-center text-sm px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Add Author
            </button>
          </div>

          {/* Table component */}
          <Table
            data={authors}
            columns={columns}
            loading={loading}
            onReload={loadAuthors}
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

      {/* Add Author Modal */}
      <Modal
        isOpen={isAddAuthorModalOpen}
        onClose={() => setIsAddAuthorModalOpen(false)}
        title="Add New Author"
      >
        {/* Pass necessary props to the form component */}
        <AddAuthorForm
          onAuthorAdded={(newAuthor) => {
            handleAuthorAdded(newAuthor);
            setIsAddAuthorModalOpen(false);
            addNotification('success', 'Author added successfully!');
          }}
          onCancel={() => setIsAddAuthorModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEditAuthorModalOpen}
        onClose={() => setIsEditAuthorModalOpen(false)}
        title="Edit Author"
      >
        {isEditAuthorModalOpen && authorToEditId && (
          <EditAuthorForm
            authorId={authorToEditId}
            onAuthorUpdated={handleAuthorUpdated}
            onCancel={() => setIsEditAuthorModalOpen(false)}
          />
        )}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="p-4">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete author <span className="font-bold text-red-600">&quot;{authorToDelete.name}&quot;</span>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete} // Call the core logic function
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