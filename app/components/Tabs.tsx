"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function Tabs() {
  const pathname = usePathname();

  return (
    <div className="flex space-x-4 p-4 bg-dt-secondary text-white rounded-t-lg">
      <Link href="/">
        <span className={`px-4 py-2 rounded ${pathname === '/' ? 'bg-dt-primary' : ''}`}>Overview</span>
      </Link>
      <Link href="/material-consumption">
        <span className={`px-4 py-2 rounded ${pathname === '/material-consumption' ? 'bg-dt-primary' : ''}`}>Material Consumption</span>
      </Link>
      <Link href="/order-placement">
        <span className={`px-4 py-2 rounded ${pathname === '/order-placement' ? 'bg-dt-primary' : ''}`}>Order Placement</span>
      </Link>
      <Link href="/goods-receipt">
        <span className={`px-4 py-2 rounded ${pathname === '/goods-receipt' ? 'bg-dt-primary' : ''}`}>Goods Receipt</span>
      </Link>
      <Link href="/lead-time">
        <span className={`px-4 py-2 rounded ${pathname === '/lead-time' ? 'bg-dt-primary' : ''}`}>Lead Time</span>
      </Link>
    </div>
  );
}

export default Tabs;