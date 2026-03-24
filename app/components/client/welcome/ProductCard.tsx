import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Productos } from '@/lib/firebase/products';
import AddToFav from '../../AddToFav';
import AddToCar from '../../AddToCar';
import { Eye } from 'lucide-react';

interface ProductCardProps {
  product: Productos;
}

const ProductCard = ({ product }: ProductCardProps) => {
  // Si tiene tallas o colores el usuario debe elegir antes de comprar
  const requiereSeleccion =
    (product.tallas && product.tallas.length > 0) ||
    (product.colores && product.colores.length > 0);

  return (
    <div className="group relative bg-eshop-bannerHome rounded-lg shadow-sm shadow-eshop-goldDeep/60 hover:shadow-md transition-shadow duration-300 overflow-hidden h-full flex flex-col">

      {/* Favorito flotante */}
      <AddToFav product={product} iconOnly />

      {/* ✅ Solo la imagen navega al producto */}
      <Link href={`/${product.slug}`} className="block">
        <div className="aspect-square overflow-hidden bg-eshop-textSecondary relative">
          {product?.imagenes && product.imagenes[0] && (
            <Image
              src={product.imagenes[0]}
              alt={product?.nombre || "Producto"}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          )}
        </div>
      </Link>

      {/* Información — fuera del Link */}
      <div className="p-4 flex flex-col grow">

        {/* ✅ Nombre también navega */}
        <Link href={`/${product.slug}`}>
          <h3 className="text-sm font-medium text-eshop-textPrimary line-clamp-2 mb-2 min-h-10 hover:text-eshop-accent transition-colors">
            {product.nombre}
          </h3>
        </Link>

        <div className="grow" />

        {/* Precio y Stock */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-1 items-baseline">
            <p className="text-lg font-bold text-eshop-accent">
              ${product.precio.toLocaleString('es-CO')}
            </p>
          </div>
          {product.stock > 0 ? (
            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
              En Stock
            </span>
          ) : (
            <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded">
              Agotado
            </span>
          )}
        </div>

        {/* ✅ Botones fuera del Link — funcionan correctamente */}
        {requiereSeleccion ? (
          <Link
            href={`/${product.slug}`}
            className="w-full py-2 px-3 bg-eshop-buttonBase hover:bg-eshop-buttonHover text-eshop-textDark rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hoverEffect shadow-sm"
          >
            <Eye className="w-4 h-4" />
            Observar
          </Link>
        ) : (
          <AddToCar product={product} />
        )}
      </div>
    </div>
  );
};

export default ProductCard;