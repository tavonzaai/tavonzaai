'use client';

let cachedSwal: any = null;

async function getSwal() {
  if (typeof window === 'undefined') return null;
  if (!cachedSwal) {
    const swalModule = await import('sweetalert2');
    const Swal = swalModule.default || swalModule;
    cachedSwal = Swal.mixin({
      background: '#121212',
      color: '#FFFFFF',
      customClass: {
        popup: 'border border-neutral-800 rounded-2xl shadow-2xl font-sans',
        title: 'text-white text-lg font-semibold',
        htmlContainer: 'text-neutral-400 text-xs sm:text-sm',
        confirmButton: 'px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-red-600 hover:bg-red-500 text-white shadow-lg mx-1.5 transition cursor-pointer',
        cancelButton: 'px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-neutral-800 hover:bg-neutral-700 text-neutral-300 mx-1.5 transition cursor-pointer',
      },
      buttonsStyling: false,
    });
  }
  return cachedSwal;
}

/**
 * Prompt confirmation modal via SweetAlert2 before deleting a table
 */
export async function confirmDeleteTable(tableName: string): Promise<boolean> {
  if (typeof window === 'undefined') return true;
  const swal = await getSwal();
  if (!swal) {
    return window.confirm(`Are you sure you want to delete ${tableName}?`);
  }
  const result = await swal.fire({
    title: `Delete Table "${tableName}"?`,
    text: `Are you sure you want to take ${tableName} out of floor service? Active sessions and assignments will be safely released.`,
    icon: 'warning',
    iconColor: '#F59E0B',
    showCancelButton: true,
    confirmButtonText: 'Yes, Delete Table',
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    focusCancel: true,
  });

  return Boolean(result?.isConfirmed);
}

/**
 * Show a success notification when table has been deleted
 */
export async function showDeleteSuccess(tableName: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const swal = await getSwal();
  if (!swal) return;
  await swal.fire({
    title: 'Table Deleted!',
    text: `Table "${tableName}" has been successfully removed from floor service.`,
    icon: 'success',
    iconColor: '#10B981',
    timer: 2500,
    timerProgressBar: true,
    showConfirmButton: false,
  });
}

/**
 * Show an error notification when table deletion fails
 */
export async function showDeleteError(message: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const swal = await getSwal();
  if (!swal) {
    alert(message);
    return;
  }
  await swal.fire({
    title: 'Deletion Failed',
    text: message,
    icon: 'error',
    iconColor: '#EF4444',
    confirmButtonText: 'Understood',
    customClass: {
      popup: 'border border-neutral-800 rounded-2xl shadow-2xl',
      title: 'text-white text-lg font-semibold',
      htmlContainer: 'text-neutral-400 text-sm',
      confirmButton: 'px-5 py-2.5 rounded-xl font-semibold text-xs bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-md transition cursor-pointer',
    },
    buttonsStyling: false,
  });
}
