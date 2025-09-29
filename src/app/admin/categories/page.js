// app/admin/categories/page.js
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Edit, LoaderCircle, Trash2, PlusCircle } from 'lucide-react';
// Assuming '@/components/admin/ui/table' and '@/components/ui/notification/NotificationProvider' exist
import Table from '@/components/admin/ui/Table';
import { useNotification } from '@/components/ui/notification/NotificationProvider';
import Modal from '@/components/admin/ui/modal/Modal';
import AddCategoryForm from '@/components/admin/categories/AddCategoryForm'; // New form component
import AddSubCategoryForm from '@/components/admin/categories/AddSubCategoryForm'; // New form component


// Define table columns outside the component to prevent re-creation on every render
const columns = [
  {
    key: 'name',
    header: 'Name',
    sortable: true,
  },
  {
    key: 'slug',
    header: 'Slug',
    sortable: true,
  },
  {
    key: 'description',
    header: 'Description',
    sortable: false,
    className: 'text-gray-600 font-light text-sm',
  },
  {
    key: 'created_at_display', // A new key for display purposes
    header: 'Created At',
    sortable: true,
    // FIX 1: Use the dedicated created_at field first, then fallback to _id
    render: (row) => { // Render receives the entire row now
      // 1. Check for the dedicated created_at field from Mongoose timestamps
      if (row?.created_at) {
        // Use dedicated created_at field (more reliable than _id parsing)
        return new Date(row.created_at).toLocaleDateString();
      }
      // 2. Fallback: Parse the date from MongoDB _id (if created_at is missing)
      if (row?._id) {
        return new Date(parseInt(row._id.substring(0, 8), 16) * 1000).toLocaleDateString();
      }
      // 3. Fail: return N/A
      return 'N/A';
    },
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (row, { handleEdit, handleDelete }) => ( // Render receives the entire row and handlers
      <div className="flex items-center space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent row click
            handleEdit(row._id);
          }}
          className="p-1 rounded-full hover:bg-yellow-100 transition-colors"
          aria-label="Edit"
        >
          <Edit className="w-4 h-4 text-yellow-600" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent row click
            handleDelete(row._id);
          }}
          className="p-1 rounded-full hover:bg-red-100 transition-colors"
          aria-label="Delete"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      </div>
    ),
  },
];


const fetchCategories = async () => {
  const res = await fetch('/api/admin/categories', {
    method: 'GET',
    headers: {
      'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
      'Content-Type': 'application/json',
    }
  });
  if (!res.ok) throw new Error('Failed to fetch categories');
  const data = await res.json();
  // console.log('Categories:', data);
  return data;
}

const fetchSubCategories = async () => {
  const res = await fetch('/api/admin/subcategories', {
    method: 'GET',
    headers: {
      'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
      'Content-Type': 'application/json',
    }
  });
  if (!res.ok) throw new Error('Failed to fetch subcategories');
  const data = await res.json();
  // console.log('Subcategories:', data);
  return data;
}

export default function Categories() {
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState([]); // Holds main category list
  const [subCategoryData, setSubCategoryData] = useState([]); // Holds sub category list
  const [mainTab, setMainTab] = useState(true); // true for Categories, false for Sub Categories

  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddSubCategoryModalOpen, setIsAddSubCategoryModalOpen] = useState(false);


  /* ------------- Parent Name Lookup Function ------------- */
  const parentNameMap = useMemo(() => {
    return categoryData.reduce((map, category) => {
      map[category._id] = category.name;
      return map;
    }, {});
  }, [categoryData]);

  // Define subCategoryColumns here to use parentNameMap
  const subCategoryColumns = useMemo(() => {
    const parentCategoryRender = (row) => { // Render receives the entire row
      return parentNameMap[row.parent_id] || 'N/A';
    };

    return [
      ...columns.slice(0, 3), // Name, Slug, Description
      {
        key: 'parent_name', // A new key for display and sorting
        header: 'Parent Category',
        sortable: true,
        render: parentCategoryRender,
      },
      columns[3], // Created At
      columns[4], // Actions
    ];
  }, [parentNameMap]);


  /* ------------- Data Fetching ------------- */
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch categories and subcategories in parallel
      const [categories, subcategories] = await Promise.all([
        fetchCategories(),
        fetchSubCategories()
      ]);
      setCategoryData(categories);
      setSubCategoryData(subcategories);
    } catch (error) {
      console.error("Error loading data:", error);
      addNotification('error', error.message || 'Error loading data.');
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    loadData();
  }, [loadData]);


  /* ------------- Handlers ------------- */
  const handleEdit = (id) => {
    if (mainTab) {
      // Editing a main category
      console.log(`Edit category:`, id);
    } else {
      // Editing a sub-category
      console.log(`Edit sub-category:`, id);
    }
    
    addNotification('info', `Editing feature for ID ${id} not yet implemented.`);
  };

  const handleDelete = (id) => {
    console.log(`Delete ${mainTab ? 'category' : 'sub-category'}:`, id);
    addNotification('info', `Deletion feature for ID ${id} not yet implemented.`);
  };

  const handleBulkAction = (action, selectedIds) => {
    if (action === 'delete') {
      console.log('Bulk delete:', selectedIds);
      addNotification('info', `Bulk deletion of ${selectedIds.length} items not yet implemented.`);
    }
  };

  const handleRowClick = (row) => {
    // Optional: handle row clicks for navigation/details
    console.log('Row clicked:', row);
  };

  const handleCategoryAdded = (newCategory) => {
    setCategoryData((prev) => [...prev, newCategory]);
  };

  const handleSubCategoryAdded = (newSubCategory) => {
    setSubCategoryData((prev) => [...prev, newSubCategory]);
  };

  /* ------------- Render ------------- */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="w-10 h-10 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 pb-6 shadow-md rounded-xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 uppercase">Category Page</h1>

      {/* Tab Navigation */}
      <div className="mb-6 flex space-x-4 border-b border-gray-200">
        <button
          className={`flex-1 py-2 px-4 text-sm cursor-pointer uppercase font-bold ${mainTab ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-500 hover:text-gray-700'
            }`}
          onClick={() => setMainTab(true)}
        >
          Categories
        </button>
        <button
          className={`flex-1 py-2 px-4 text-sm cursor-pointer uppercase font-bold ${!mainTab ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-500 hover:text-gray-700'
            }`}
          onClick={() => setMainTab(false)}
        >
          Subcategories
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end mb-4">
        {mainTab ? (
          <button
            onClick={() => setIsAddCategoryModalOpen(true)}
            className="flex items-center text-sm px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add Category
          </button>
        ) : (
          <button
            onClick={() => setIsAddSubCategoryModalOpen(true)}
            className="flex items-center text-sm px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add Subcategory
          </button>
        )}
      </div>

      {/* Table Display */}
      {mainTab ? (
        <Table
          data={categoryData}
          columns={columns}
          onRowClick={handleRowClick}
          onBulkAction={handleBulkAction}
          actions={{ handleEdit, handleDelete }} // Pass handlers to columns
          searchableKeys={['name', 'slug', 'description']}
        />
      ) : (
        <Table
          data={subCategoryData}
          columns={subCategoryColumns} // Use subCategoryColumns for subcategories
          onRowClick={handleRowClick}
          onBulkAction={handleBulkAction}
          actions={{ handleEdit, handleDelete }} // Pass handlers to columns
          searchableKeys={['name', 'slug', 'description', 'parent_name']} // Add parent_name for search
        />
      )}

      {/* Add Category Modal */}
      <Modal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        title="Add New Category"
      >
        <AddCategoryForm
          onCategoryAdded={(newCategory) => {
            handleCategoryAdded(newCategory);
            setIsAddCategoryModalOpen(false);
            addNotification('success', 'Category added successfully!');
          }}
          onCancel={() => setIsAddCategoryModalOpen(false)}
        />
      </Modal>

      {/* Add SubCategory Modal */}
      <Modal
        isOpen={isAddSubCategoryModalOpen}
        onClose={() => setIsAddSubCategoryModalOpen(false)}
        title="Add New Subcategory"
      >
        <AddSubCategoryForm
          onSubCategoryAdded={(newSubCategory) => {
            handleSubCategoryAdded(newSubCategory);
            setIsAddSubCategoryModalOpen(false);
            addNotification('success', 'Subcategory added successfully!');
          }}
          onCancel={() => setIsAddSubCategoryModalOpen(false)}
          categories={categoryData} // Pass main categories to the subcategory form
        />
      </Modal>
    </div>
  );
}