import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ExternalLink } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Product {
  id: string;
  title: string;
  embedUrl: string;
  thumbnail: string;
  createdAt: any;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sản phẩm</h1>
          <p className="text-sm text-slate-500">Mua sắm và khám phá các sản phẩm nổi bật</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12"><p className="text-slate-500">Đang tải...</p></div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl">
          <p className="text-slate-500">Chưa có sản phẩm nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <motion.a
              key={product.id}
              href={product.embedUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col"
            >
              <div className="aspect-square relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                {product.thumbnail ? (
                  <img src={product.thumbnail} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <ShoppingBag className="w-12 h-12 opacity-50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white text-black opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all flex items-center justify-center shadow-xl">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2">{product.title}</h3>
                <p className="text-xs text-slate-500 mt-2 mt-auto pt-2 flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Mở liên kết mua hàng
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </div>
  );
}
