import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

const isStudioRoute = createRouteMatcher(['/studio(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isStudioRoute(req)) {
    const { userId } = await auth();
    
    // Si no está logueado, redirige al login
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }
    
    // Obtener el usuario completo desde Clerk
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const email = user.emailAddresses[0]?.emailAddress;
      
      console.log('========== MIDDLEWARE DEBUG ==========');
      console.log('User ID:', userId);
      console.log('Email obtenido:', email);
      console.log('=====================================');
      
      // Lista de emails admin
      const ADMIN_EMAILS = ['cgaviria930@gmail.com','hincapiestefania110@gmail.com'];
      
      if (!email || !ADMIN_EMAILS.includes(email.toLowerCase())) {
        console.log('❌ ACCESO DENEGADO');
        return NextResponse.redirect(new URL('/?error=unauthorized', req.url));
      }
      
      console.log('✅ ACCESO PERMITIDO');
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      return NextResponse.redirect(new URL('/?error=unauthorized', req.url));
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};