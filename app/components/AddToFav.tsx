"use client";

import { Productos } from '@/lib/firebase/products';
import { Heart } from 'lucide-react';
import useStore from '@/store';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import { useUser } from '@clerk/nextjs';

interface Props {
  product: Productos;
  iconOnly?: boolean;
}

const AddToFav = ({ product, iconOnly = false }: Props) => {
  const { addToFavorite, isFavorite } = useStore();
  const { isSignedIn, user } = useUser();
  const isInFavorites = isFavorite(product.id);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      toast.error('Debes iniciar sesión para guardar favoritos', {
        position: 'top-center',
        duration: 1500,
      });
      return;
    }

    try {
      // supply user id to ensure the remote update happens even if store.userId
      // hasn't been populated yet by AuthSync
      await addToFavorite(product);
      if (isInFavorites) {
        toast.success('Eliminado de Favoritos', {
          position: "top-center",
          duration: 1200,
        });
      } else {
        toast.success('¡Añadido a Favoritos!', {
          position: "top-center",
          duration: 1200,
        });
      }
    } catch (err) {
      console.error('Error toggling favorite', err);
    }
  };

  if (iconOnly) {
    return (
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleToggleFavorite}
        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md shadow-black hover:shadow-lg transition-all z-10"
      >
        <Heart
          className={`w-5 h-5 transition-colors ${
            isInFavorites ? 'fill-red-500 text-red-500' : 'text-danashop-textDark hover:text-red-500'
          }`}
        />
      </motion.button>
    );
  }

  return (
    <button
      onClick={handleToggleFavorite}
      className={`w-full py-2 px-4 border-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
        isInFavorites
          ? 'border-red-500 text-red-500 bg-red-50'
          : 'border-gray-300 text-danashop-textPrimary hover:border-red-500 hover:text-red-500'
      }`}
    >
      <Heart
        className={`w-5 h-5 ${isInFavorites ? 'fill-red-500' : ''}`}
      />
      {isInFavorites ? 'En Favoritos' : 'Favoritos'}
    </button>
  );
};

export default AddToFav;