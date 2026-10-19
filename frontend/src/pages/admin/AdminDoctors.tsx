import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";
import LoadingState from "../../components/LoadingState";
import ErrorState from "../../components/ErrorState";
import { useDoctors } from "../../hooks/useDoctors";

import { useZodForm } from "../../hooks/useZodForm";
import { errorMessage } from "../../lib/fetcher";
import {
  doctorCreateSchema,
  type DoctorCreateFormValues,
  type DoctorUpdateFormValues,
} from "../../schemas";
import type { DoctorResponseDTO } from "../../types";

const specializationOptions = [
  "Cardiology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Dermatology",
  "General Medicine",
];

const emptyCreate: DoctorCreateFormValues = {
  fullName: "",
  email: "",
  password: "",
  specialization: "",
  phone: "",
};

const emptyEdit: DoctorUpdateFormValues = {
  fullName: "",
  specialization: "",
  phone: "",
};

export default function AdminDoctors() {
  const { doctors, isLoading, error, create, update, remove, invalidate } =
    useDoctors();
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<DoctorResponseDTO | null>(null);
  const [serverError, setServerError] = useState("");

  const createForm = useZodForm<DoctorCreateFormValues>({
    initialValues: emptyCreate,
    schema: doctorCreateSchema,
    onSubmit: async (values) => {
      setServerError("");
      try {
        await create(values);
        closeModal();
      } catch (e) {
        setServerError(errorMessage(e));
      }
    },
  });

  const editForm = useZodForm<DoctorUpdateFormValues>({
    initialValues: emptyEdit,
    schema: doctorCreateSchema,
    onSubmit: async (values) => {
      setServerError("");
      try {
        if (!editing) return;
        await update(editing.id, values);
        closeModal();
      } catch (e) {
        setServerError(errorMessage(e));
      }
    },
  });

  const openCreate = () => {
    setEditing(null);
    createForm.reset();
    setModalMode("create");
    setServerError("");
  };

  const openEdit = (doc: DoctorResponseDTO) => {
    setEditing(doc);
    editForm.reset({
      fullName: doc.fullName,
      specialization: doc.specialization,
      phone: doc.phone,
    });
    setModalMode("edit");
    setServerError("");
  };

  const closeModal = () => {
    setModalMode(null);
    setEditing(null);
    setServerError("");
  };

  const handleDelete = async (doc: DoctorResponseDTO) => {
    if (!window.confirm(`Delete doctor ${doc.fullName}?`)) return;
    try {
      await remove(doc.id);
    } catch (e) {
      alert(errorMessage(e));
      await invalidate();
    }
  };

  const isCreate = modalMode === "create";
  const activeForm = isCreate ? createForm : editForm;

  return (
    <div>
      <PageHeader
        title="Doctor Management"
        subtitle="Manage hospital doctors and their profiles"
        action={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Doctor
          </button>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {isLoading && <LoadingState label="Loading doctors..." />}
        {error && (
          <ErrorState message={errorMessage(error)} onRetry={invalidate} />
        )}

        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Name</th>
                  <th className="text-left px-4 py-3 font-semibold">Email</th>
                  <th className="text-left px-4 py-3 font-semibold">
                    Specialization
                  </th>
                  <th className="text-left px-4 py-3 font-semibold">Phone</th>
                  <th className="text-right px-4 py-3 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {doctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {doc.fullName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{doc.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">
                        {doc.specialization}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{doc.phone}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => openEdit(doc)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {doctors.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-12 text-center text-slate-400 text-sm"
                    >
                      No doctors found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={!!modalMode}
        onClose={closeModal}
        title={isCreate ? "Add Doctor" : "Edit Doctor"}
      >
        <form
          onSubmit={activeForm.handleSubmit}
          className="space-y-3"
          noValidate
        >
          {serverError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {serverError}
            </div>
          )}
          <FormField
            label="Full Name"
            error={activeForm.errors.fullName}
            touched={activeForm.touched.fullName}
          >
            <input
              name="fullName"
              value={activeForm.values.fullName}
              onChange={activeForm.handleChange}
              onBlur={() => activeForm.setTouched("fullName")}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm"
            />
          </FormField>
          {isCreate && "email" in createForm.values && (
            <>
              <FormField
                label="Email"
                error={createForm.errors.email}
                touched={createForm.touched.email}
              >
                <input
                  name="email"
                  value={createForm.values.email}
                  onChange={createForm.handleChange}
                  onBlur={() => createForm.setTouched("email")}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm"
                />
              </FormField>
              <FormField
                label="Password"
                error={createForm.errors.password}
                touched={createForm.touched.password}
                hint="Min 8 characters"
              >
                <input
                  type="password"
                  name="password"
                  value={createForm.values.password}
                  onChange={createForm.handleChange}
                  onBlur={() => createForm.setTouched("password")}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm"
                />
              </FormField>
            </>
          )}
          <FormField
            label="Specialization"
            error={activeForm.errors.specialization}
            touched={activeForm.touched.specialization}
          >
            <select
              name="specialization"
              value={activeForm.values.specialization}
              onChange={activeForm.handleChange}
              onBlur={() => activeForm.setTouched("specialization")}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm bg-white"
            >
              <option value="">Select...</option>
              {specializationOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </FormField>
          <FormField
            label="Phone"
            error={activeForm.errors.phone}
            touched={activeForm.touched.phone}
          >
            <input
              name="phone"
              value={activeForm.values.phone}
              onChange={activeForm.handleChange}
              onBlur={() => activeForm.setTouched("phone")}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm"
            />
          </FormField>
          {/* <FormField
            label="Gender"
            error={activeForm.errors.gender}
            touched={activeForm.touched.gender}
          >
            <select
              name="gender"
              value={activeForm.values.gender}
              onChange={activeForm.handleChange}
              onBlur={() => activeForm.setTouched("gender")}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm bg-white"
            >
              <option value="">Select...</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </FormField> */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={activeForm.submitting}
              className="flex-1 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {activeForm.submitting
                ? "Saving..."
                : isCreate
                  ? "Create"
                  : "Save"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
