import { useOffers } from '@/hooks/useOffers';
import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

const CountdownTimer = ({ endDate }: { endDate: string }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('انتهى'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${d}ي ${h}س ${m}د`);
    };
    calc();
    const timer = setInterval(calc, 60000);
    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <span className="flex items-center gap-1 text-xs font-semibold text-primary-foreground">
      <Timer size={12} /> {timeLeft}
    </span>
  );
};

export const OffersMarquee = () => {
  const { data: offers } = useOffers();
  if (!offers?.length) return null;

  return (
    <div className="overflow-hidden gradient-primary rounded-lg py-2 px-1">
      <div className="flex animate-marquee whitespace-nowrap gap-8" dir="rtl">
        {[...offers, ...offers].map((offer, i) => (
          <div key={`${offer.id}-${i}`} className="flex items-center gap-3 text-primary-foreground text-sm shrink-0">
            <span className="font-bold">{offer.title_ar}</span>
            {offer.discount_percentage && <span className="bg-primary-foreground/20 px-2 py-0.5 rounded-full text-xs">خصم {offer.discount_percentage}%</span>}
            {offer.end_date && <CountdownTimer endDate={offer.end_date} />}
            <span className="text-primary-foreground/40">|</span>
          </div>
        ))}
      </div>
    </div>
  );
};
