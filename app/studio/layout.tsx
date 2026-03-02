import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { SignOutButton } from '@clerk/nextjs';
import HeaderAdmin from '../components/admin/HeaderAdmin';

// Lista de emails admin
const ADMIN_EMAILS = ['cgaviria930@gmail.com', 'hincapiestefania110@gmail.com'];

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  
  // Si no está logueado, redirige al login
  if (!userId) {
    redirect('/sign-in?redirect_url=/studio');
  }

  // Obtener email del usuario
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  // Verificar si es admin
  if (!email || !ADMIN_EMAILS.includes(email.toLowerCase())) {
    redirect('/?error=unauthorized');
  }

  return (
    <>
      {/* Sidebar */}
      <HeaderAdmin />

      {/* Main Content */}
      <main className="min-h-screen pt-4 md:pt-10">
        {children}
      </main>
    </>
  );
}