import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-light text-gray-900 mb-2">
            La Casita de las Flores
          </h1>
          <h2 className="text-xl font-medium text-primary-500">
            Panel Administrador
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Inicia sesión para acceder al panel de administración
          </p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
}
