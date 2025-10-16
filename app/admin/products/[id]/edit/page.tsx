import ProductForm from "@/components/products/ProductForm";
import { getProductById } from "@/lib/products";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Editar Producto</h1>
        <p className="text-gray-600">Actualiza la información del producto</p>
      </div>

      <ProductForm product={product} />
    </div>
  );
}
