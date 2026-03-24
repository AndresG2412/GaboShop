import { getAllCategoriesAdmin } from '@/lib/firebase/admin';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import ProductForm from '@/app/components/admin/ProductForm';
import type { Productos } from '@/lib/firebase/products';
import Container from '@/app/components/Container';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { slug } = await params;
  const categories = await getAllCategoriesAdmin();
  
  const productsRef = collection(db, 'productos');
  const q = query(productsRef, where('slug', '==', slug));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    notFound();
  }

  const productDoc = snapshot.docs[0];
  const productData = productDoc.data();
  
  const product: Productos & { id: string } = {
    id: productDoc.id,
    nombre: productData.nombre,
    slug: productData.slug,
    precio: productData.precio,
    imagenes: productData.imagenes,
    descripcion: productData.descripcion,
    categorias: productData.categorias,
    stock: productData.stock,
    subido: productData.subido?.toDate() || new Date(),
  };

  return (
    <Container>
      <div className="py-6">
        <div className='flex justify-end'>
          <button type='button' className='mb-4'>
            <Link
              href="/studio/products"
              className="flex items-center gap-2 text-eshop-textError hover:text-eshop-accent transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a productos
            </Link>
          </button>
        </div>

        <div className='bg-eshop-formsBackground/30 rounded-lg mb-20 border border-eshop-borderSubtle shadow-sm'>
          <h1 className="text-3xl py-5 text-center font-bold text-eshop-textPrimary tracking-wide">
            Editar Producto
          </h1>

          <ProductForm categories={categories} product={product} isEditing />
        </div>
      </div>
    </Container>
  );
}