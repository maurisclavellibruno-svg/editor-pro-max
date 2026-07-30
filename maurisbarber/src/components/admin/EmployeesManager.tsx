"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { setEmployeeLogin, upsertEmployee } from "@/actions/employees";

interface Employee {
  id: string;
  name: string;
  active: boolean;
  email: string | null;
}

export function EmployeesManager({ employees }: { employees: Employee[] }) {
  const [list, setList] = useState(employees);
  const [showNewForm, setShowNewForm] = useState(false);
  const [loginFormFor, setLoginFormFor] = useState<string | null>(null);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Empleados</h1>
        <Button variant="accent" onClick={() => setShowNewForm(true)}>
          + Nuevo empleado
        </Button>
      </div>

      <div className="space-y-3">
        {list.map((emp) => (
          <div key={emp.id} className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-ink">{emp.name}</p>
                  {!emp.active && (
                    <span className="rounded-full bg-surface-alt px-2 py-0.5 text-xs text-ink-muted">
                      Inactivo
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-ink-muted">
                  {emp.email ? `Login: ${emp.email}` : "Sin acceso al panel todavía"}
                </p>
              </div>
              <div className="flex shrink-0 gap-3">
                <button
                  type="button"
                  className="text-sm font-medium text-ink-muted hover:text-ink"
                  onClick={async () => {
                    await upsertEmployee({ id: emp.id, name: emp.name, active: !emp.active });
                    setList(list.map((e) => (e.id === emp.id ? { ...e, active: !e.active } : e)));
                  }}
                >
                  {emp.active ? "Desactivar" : "Activar"}
                </button>
                <button
                  type="button"
                  className="text-sm font-medium text-accent"
                  onClick={() => setLoginFormFor(emp.id)}
                >
                  {emp.email ? "Cambiar acceso" : "Dar acceso al panel"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showNewForm && (
        <NewEmployeeModal
          onClose={() => setShowNewForm(false)}
          onCreated={(employee) => {
            setList([...list, employee]);
            setShowNewForm(false);
          }}
        />
      )}

      {loginFormFor && (
        <EmployeeLoginModal
          employeeId={loginFormFor}
          onClose={() => setLoginFormFor(null)}
          onSaved={(email) => {
            setList(list.map((e) => (e.id === loginFormFor ? { ...e, email } : e)));
            setLoginFormFor(null);
          }}
        />
      )}
    </div>
  );
}

function NewEmployeeModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (employee: Employee) => void;
}) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await upsertEmployee({ name, active: true });
    setSaving(false);
    onCreated({ id: crypto.randomUUID(), name, active: true, email: null });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-floating">
        <h2 className="text-lg font-semibold text-ink">Nuevo empleado</h2>
        <label className="mt-4 block text-sm">
          <span className="mb-1.5 block font-medium text-ink-soft">Nombre</span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-line px-4 py-3"
          />
        </label>
        <div className="mt-5 flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="accent" className="flex-1" disabled={saving}>
            {saving ? "Guardando…" : "Crear"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function EmployeeLoginModal({
  employeeId,
  onClose,
  onSaved,
}: {
  employeeId: string;
  onClose: () => void;
  onSaved: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await setEmployeeLogin({ employeeId, email, password });
      onSaved(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-floating">
        <h2 className="text-lg font-semibold text-ink">Acceso al panel</h2>
        <p className="mt-1 text-sm text-ink-muted">Le permite a este empleado iniciar sesión en el panel admin.</p>
        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink-soft">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-line px-4 py-3"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink-soft">Contraseña</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-line px-4 py-3"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="mt-5 flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="accent" className="flex-1" disabled={saving}>
            {saving ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
