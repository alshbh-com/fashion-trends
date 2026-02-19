import { useCategories } from '@/hooks/useCategories';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export const CategorySection = () => {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto hide-scrollbar py-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="w-20 h-24 rounded-xl shrink-0" />
        ))}
      </div>
    );
  }

  if (!categories?.length) return null;

  return (
    <div className="flex gap-3 overflow-x-auto hide-scrollbar py-2" dir="rtl">
      {categories.map(cat => (
        <Link
          key={cat.id}
          to={`/categories?id=${cat.id}`}
          className="flex flex-col items-center gap-1.5 shrink-0 w-20"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary-light border-2 border-primary/10 overflow-hidden flex items-center justify-center">
            {cat.image_url ? (
              <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-primary">{cat.name.charAt(0)}</span>
            )}
          </div>
          <span className="text-[11px] font-medium text-center leading-tight line-clamp-2">{cat.name}</span>
        </Link>
      ))}
    </div>
  );
};
