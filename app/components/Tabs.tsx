"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function Tabs() {
  const pathname = usePathname();

  return (
    <div className="flex">
      <Link href="/">
        <div className={`px-5 py-2 rounded-t-xl ${pathname === '/' ? 'bg-white font-semibold' : 'bg-gray-200'}`}>Overview</div>
      </Link>
      <Link href="/material-consumption">
        <div className={`px-5 py-2 rounded-t-xl ${pathname === '/material-consumption' ? 'bg-white font-semibold' : 'bg-gray-200'}`}>Material Consumption</div>
      </Link>
      <Link href="/order-placement">
        <div className={`px-5 py-2 rounded-t-xl ${pathname === '/order-placement' ? 'bg-white font-semibold' : 'bg-gray-200'}`}>Order Placement</div>
      </Link>
      <Link href="/goods-receipt">
        <div className={`px-5 py-2 rounded-t-xl ${pathname === '/goods-receipt' ? 'bg-white font-semibold' : 'bg-gray-200'}`}>Goods Receipt</div>
      </Link>
      <Link href="/lead-time">
        <div className={`px-5 py-2 rounded-t-xl ${pathname === '/lead-time' ? 'bg-white font-semibold' : 'bg-gray-200'}`}>Lead Time</div>
      </Link>
      <Link href="/forecast">
        <div className={`px-5 py-2 rounded-t-xl ${pathname === '/forecast' ? 'bg-white font-semibold' : 'bg-gray-200'}`}>Forecast</div>
      </Link>
      <Link href="/inventory-simulation">
        <div className={`px-5 py-2 rounded-t-xl ${pathname === '/inventory-simulation' ? 'bg-white font-semibold' : 'bg-gray-200'}`}>Inventory Simulation</div>
      </Link>
    </div>
  );
}

export default Tabs;