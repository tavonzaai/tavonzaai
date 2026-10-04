'use client';

import React, { useState } from 'react';
import {
  EmployeesHeader,
  EmployeesKPICards,
  EmployeesFilters,
  EmployeeCard,
  EmployeeDetailModal,
  AddEmployeeModal,
} from './components';
import { INITIAL_EMPLOYEES, INITIAL_EMPLOYEES_KPIS } from './employeesData';
import { Employee } from './types';

export default function EmployeesView() {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [selectedRole, setSelectedRole] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesRole =
      selectedRole === 'All' ||
      emp.role.toLowerCase().includes(selectedRole.toLowerCase());

    const matchesSearch =
      !searchQuery.trim() ||
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.bio.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesRole && matchesSearch;
  });

  // Calculate dynamic KPIs
  const totalStaff = employees.length;
  const onShift = employees.filter(
    (e) => e.status === 'On Shift' || e.status === 'On Duty'
  ).length;
  const avgRating =
    employees.reduce((acc, curr) => acc + curr.rating, 0) / (employees.length || 1);
  const tablesServed = employees.reduce((acc, curr) => acc + curr.tablesToday, 0);

  const kpis = {
    totalStaff,
    onShift,
    avgRating,
    tablesServed,
  };

  // Handlers
  const handleEdit = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsDetailOpen(true);
  };

  const handleSaveEmployee = (updated: Employee) => {
    setEmployees((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
  };

  const handleAddEmployee = (newEmpData: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      ...newEmpData,
      id: `emp-${Date.now()}`,
    };
    setEmployees((prev) => [newEmployee, ...prev]);
  };

  const handleDeleteEmployee = (empId: string) => {
    setEmployees((prev) => prev.filter((item) => item.id !== empId));
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-12">
      {/* 1. Header with Add Employee trigger */}
      <EmployeesHeader onAddEmployee={() => setIsAddOpen(true)} />

      {/* 2. 4 Stat KPI Cards */}
      <EmployeesKPICards kpis={kpis} />

      {/* 3. Role Filters & Search */}
      <EmployeesFilters
        selectedRole={selectedRole}
        onSelectRole={setSelectedRole}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalCount={employees.length}
      />

      {/* 4. Employee Cards Grid */}
      {filteredEmployees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 w-full">
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={handleEdit}
              onDelete={handleDeleteEmployee}
            />
          ))}
        </div>
      ) : (
        <div className="w-full py-16 text-center bg-white/5 rounded-xl border border-white/10 font-['Inter']">
          <p className="text-stone-300 text-base font-medium">
            No employees found matching &quot;{searchQuery || selectedRole}&quot;
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedRole('All');
              setSearchQuery('');
            }}
            className="mt-3 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* 5. Employee Detail / Edit Drawer Modal */}
      <EmployeeDetailModal
        employee={selectedEmployee}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onSave={handleSaveEmployee}
      />

      {/* 6. Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAddEmployee}
      />
    </div>
  );
}
