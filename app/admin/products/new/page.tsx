import ProductForm from "@/components/products/ProductForm";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Nuevo Producto</h1>
        <p className="text-gray-600">Crea un nuevo producto para tu catálogo</p>
      </div>

      <ProductForm />
    </div>
  );
}
