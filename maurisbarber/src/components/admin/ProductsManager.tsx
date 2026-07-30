"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { deleteProduct, recordProductSale, upsertProduct } from "@/actions/products";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  active: boolean;
  stock: number | null;
}

const emptyForm: Product = {
  id: "",
  name: "",
  description: "",
  price: 0,
  imageUrl: "",
  active: true,
  stock: null,
};

export function ProductsManager({ products }: { products: Product[] }) {
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [sellingProduct, setSellingProduct] = useState<Product | null>(null);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Productos</h1>
        <Button
          variant="accent"
          onClick={() => {
            setEditing({ ...emptyForm });
            setShowForm(true);
          }}
        >
          + Nuevo producto
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {products.map((product) => (
          <div key={product.id} className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-ink">{product.name}</p>
                  {!product.active && (
                    <span className="rounded-full bg-surface-alt px-2 py-0.5 text-xs text-ink-muted">
                      Inactivo
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-ink-muted">
                  ${product.price}
                  {product.stock !== null && ` · Stock: ${product.stock}`}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  className="text-sm font-medium text-accent"
                  onClick={() => setSellingProduct(product)}
                >
                  Vender
                </button>
                <button
                  type="button"
                  className="text-sm font-medium text-ink-muted hover:text-ink"
                  onClick={() => {
                    setEditing(product);
                    setShowForm(true);
                  }}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                  onClick={async () => {
                    if (confirm(`¿Eliminar "${product.name}"?`)) {
                      await deleteProduct(product.id);
                    }
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <p className="text-sm text-ink-muted">Todavía no cargaste productos.</p>
        )}
      </div>

      {showForm && editing && (
        <ProductFormModal
          product={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => setShowForm(false)}
        />
      )}

      {sellingProduct && (
        <SellProductModal
          product={sellingProduct}
          onClose={() => setSellingProduct(null)}
          onSold={() => setSellingProduct(null)}
        />
      )}
    </div>
  );
}

function ProductFormModal({
  product,
  onClose,
  onSaved,
}: {
  product: Product;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(product);
  const [trackStock, setTrackStock] = useState(product.stock !== null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await upsertProduct({
        ...form,
        id: form.id || undefined,
        stock: trackStock ? (form.stock ?? 0) : undefined,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el producto");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-floating">
        <h2 className="text-lg font-semibold text-ink">{form.id ? "Editar producto" : "Nuevo producto"}</h2>
        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink-soft">Nombre</span>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-line px-4 py-3"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink-soft">Descripción</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full rounded-xl border border-line px-4 py-3"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink-soft">Precio ($)</span>
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className="w-full rounded-xl border border-line px-4 py-3"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={trackStock} onChange={(e) => setTrackStock(e.target.checked)} />
            <span className="font-medium text-ink-soft">Controlar stock</span>
          </label>
          {trackStock && (
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink-soft">Stock actual</span>
              <input
                type="number"
                value={form.stock ?? 0}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                className="w-full rounded-xl border border-line px-4 py-3"
              />
            </label>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            <span className="font-medium text-ink-soft">Activo</span>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="accent" className="flex-1" disabled={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function SellProductModal({
  product,
  onClose,
  onSold,
}: {
  product: Product;
  onClose: () => void;
  onSold: () => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TRANSFER" | "MERCADO_PAGO" | "DEBIT" | "CREDIT">(
    "CASH",
  );
  const [customerPhone, setCustomerPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await recordProductSale({ productId: product.id, quantity, paymentMethod, customerPhone });
      onSold();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar la venta");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-floating">
        <h2 className="text-lg font-semibold text-ink">Vender {product.name}</h2>
        <p className="mt-1 text-sm text-ink-muted">${product.price} c/u</p>
        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink-soft">Cantidad</span>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full rounded-xl border border-line px-4 py-3"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink-soft">Método de pago</span>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
              className="w-full rounded-xl border border-line px-4 py-3"
            >
              <option value="CASH">Efectivo</option>
              <option value="TRANSFER">Transferencia</option>
              <option value="MERCADO_PAGO">Mercado Pago</option>
              <option value="DEBIT">Débito</option>
              <option value="CREDIT">Crédito</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink-soft">Teléfono del cliente (opcional)</span>
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full rounded-xl border border-line px-4 py-3"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="accent" className="flex-1" disabled={saving}>
              {saving ? "Guardando…" : "Registrar venta"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
