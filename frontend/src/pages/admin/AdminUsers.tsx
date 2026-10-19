import { useState, useMemo } from "react";
import { Search, Plus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";
import LoadingState from "../../components/LoadingState";
import ErrorState from "../../components/ErrorState";
import { useUsers } from "../../hooks/useUsers";
import { useZodForm } from "../../hooks/useZodForm";
import { errorMessage } from "../../lib/fetcher";
import type {Role, UserResponseDTO } from "../../types";
import {
  userCreateSchema,
  userUpdateSchema,
  type UserCreateFormValues,
  type UserUpdateFormValues,
} from "../../schemas";

const roleColors: Record<Role, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  DOCTOR: "bg-teal-100 text-teal-700",
  PATIENT: "bg-blue-100 text-blue-700",
};

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | Role>("");

  const {
    users,
    isLoading,
    error,
    create,
    update,
    setEnabled,
    remove,
    invalidate,
  } = useUsers();

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<UserResponseDTO| null>(null);
  const [serverError, setServerError] = useState("");

  const createForm = useZodForm<UserCreateFormValues>({
    initialValues: {
      displayName: "",
      email: "",
      role: "PATIENT",
      password: "",
      enabled: true,
    },
    schema: userCreateSchema,
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

  const editForm = useZodForm<UserUpdateFormValues>({
    initialValues: { displayName: "", email: "", role: "PATIENT" , enabled: true},
    schema: userUpdateSchema,
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

  const openEdit = (user: UserResponseDTO) => {
    setEditing(user);
    editForm.reset({
      displayName: user.displayName,
      email: user.email,
      role: user.role,
    });
    setModalMode("edit");
    setServerError("");
  };

  const closeModal = () => {
    setModalMode(null);
    setEditing(null);
    setServerError("");
  };

  const handleToggle = async (user: UserResponseDTO) => {
    try {
      await setEnabled(user.id, !user.enabled);
    } catch (e) {
      alert(errorMessage(e));
      await invalidate();
    }
  };

  const handleDelete = async (user: UserResponseDTO) => {
    if (!window.confirm(`Delete user ${user.email}?`)) return;
    try {
      await remove(user.id);
    } catch (e) {
      alert(errorMessage(e));
      await invalidate();
    }
  };

  const filtered = useMemo(
    () =>
      users.filter((u) => {
        const matchesSearch =
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          u.displayName.toLowerCase().includes(search.toLowerCase());
        const matchesRole = !roleFilter || u.role === roleFilter;
        return matchesSearch && matchesRole;
      }),
    [users, search, roleFilter],
  );

  const isCreate = modalMode === "create";
  const activeForm = isCreate ? createForm : editForm;

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Manage all system users and their access"
        action={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" /> Add User
          </button>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as "" | Role)}
            className="px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm bg-white"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="DOCTOR">Doctor</option>
            <option value="PATIENT">Patient</option>
          </select>
        </div>

        {isLoading && <LoadingState label="Loading users..." />}
        {error && (
          <ErrorState
            message={errorMessage(error)}
            onRetry={() => invalidate()}
          />
        )}

        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Name</th>
                  <th className="text-left px-4 py-3 font-semibold">Email</th>
                  <th className="text-left px-4 py-3 font-semibold">Role</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-right px-4 py-3 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {user.displayName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleColors[user.role]}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(user)}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold ${user.enabled ? "text-green-600" : "text-slate-400"}`}
                      >
                        {user.enabled ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        {user.enabled ? "Enabled" : "Disabled"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => openEdit(user)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-12 text-center text-slate-400 text-sm"
                    >
                      No users found
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
        title={isCreate ? "Add New User" : "Edit User"}
      >
        <form
          onSubmit={activeForm.handleSubmit}
          className="space-y-4"
          noValidate
        >
          {serverError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {serverError}
            </div>
          )}
          <FormField
            label="Display Name"
            error={activeForm.errors.displayName}
            touched={activeForm.touched.displayName}
          >
            <input
              name="displayName"
              value={activeForm.values.displayName}
              onChange={activeForm.handleChange}
              onBlur={() => activeForm.setTouched("displayName")}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm"
            />
          </FormField>
          <FormField
            label="Email"
            error={activeForm.errors.email}
            touched={activeForm.touched.email}
          >
            <input
              name="email"
              value={activeForm.values.email}
              onChange={activeForm.handleChange}
              onBlur={() => activeForm.setTouched("email")}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm"
            />
          </FormField>
          <FormField
            label="Role"
            error={activeForm.errors.role}
            touched={activeForm.touched.role}
          >
            <select
              name="role"
              value={activeForm.values.role}
              onChange={activeForm.handleChange}
              onBlur={() => activeForm.setTouched("role")}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm bg-white"
            >
              <option value="PATIENT">Patient</option>
              <option value="DOCTOR">Doctor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </FormField>
          <FormField
            label="Enabled"
            error={activeForm.errors.enabled}
            touched={activeForm.touched.enabled}
          >
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="enabled"
                checked={activeForm.values.enabled ?? true}
                onChange={(e) =>
                  activeForm.setValue("enabled", e.target.checked)
                }
              />
              Account enabled
            </label>
          </FormField>
          {isCreate && "password" in createForm.values && (
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
          )}
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
                  ? "Create User"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
