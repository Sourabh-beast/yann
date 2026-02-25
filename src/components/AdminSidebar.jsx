'use client'
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
    Activity, Users, Briefcase, ClipboardList, Menu, X, LogOut,
    AlertTriangle, DollarSign, Package, Settings, BarChart3, Star,
    Bell, Gift, HeadphonesIcon, FileText, PhoneCall
} from 'lucide-react';

const sidebarItems = [
    { label: 'Dashboard', href: '/admin', icon: Activity, exact: true },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Services', href: '/admin/services', icon: Package },
    { label: 'Service Providers', href: '/admin/providers', icon: Briefcase },
    { label: 'Service Requests', href: '/admin/service-requests', icon: AlertTriangle },
    { label: 'Homeowners', href: '/admin/homeowners', icon: Users },
    { label: 'Call Requests', href: '/admin/call-requests', icon: PhoneCall },
    { label: 'Bookings', href: '/admin/bookings', icon: ClipboardList },
    { label: 'Reviews', href: '/admin/reviews', icon: Star },
    { label: 'Financials', href: '/admin/financials', icon: DollarSign },
    { label: 'Notifications', href: '/admin/notifications', icon: Bell },
    { label: 'Promotions', href: '/admin/promotions', icon: Gift },
    { label: 'Support Tickets', href: '/admin/support', icon: HeadphonesIcon },
    { label: 'Audit Logs', href: '/admin/logs', icon: FileText },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const navRef = useRef(null);

    const handleLogout = async () => {
        try {
            await fetch('/api/admin/logout', { method: 'POST' });
            router.push('/admin/login');
            router.refresh();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const confirmLogout = () => {
        setShowLogoutConfirm(false);
        handleLogout();
    };

    const isActive = (item) => {
        if (item.exact) return pathname === item.href;
        return pathname === item.href || pathname.startsWith(item.href + '/');
    };

    const activeHref = sidebarItems.find((item) => isActive(item))?.href ?? null;

    useEffect(() => {
        const nav = navRef.current;
        if (!nav) return;

        setSidebarOpen(false);

        nav.scrollTop = 0;

        if (activeHref) {
            const activeEl = nav.querySelector(`[data-href="${activeHref}"]`);
            if (activeEl && typeof activeEl.scrollIntoView === 'function') {
                activeEl.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [pathname, activeHref]);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
            >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 shadow-xl z-40 transform transition-transform duration-300 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="p-6 border-b border-gray-200 shrink-0">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        YANN Admin
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Management Panel</p>
                </div>

                <nav ref={navRef} className="p-4 overflow-y-auto flex-1 min-h-0">
                    <ul className="space-y-2">
                        {sidebarItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item);
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        data-href={item.href}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${active
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                                : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5 shrink-0" />
                                        <span className="truncate">{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-gray-200 bg-white shrink-0">
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-300 font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
                        <div className="flex items-start gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Logout Confirmation</h3>
                                <p className="mt-1 text-sm text-gray-600">Are you sure you want to logout from admin panel?</p>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowLogoutConfirm(false)}
                                className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmLogout}
                                className="rounded-full bg-red-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-red-700"
                            >
                                Yes, Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
