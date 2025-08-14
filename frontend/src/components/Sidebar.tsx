// file: frontend/src/components/Sidebar.tsx
import { FiSearch, FiUpload, FiSettings, FiX } from 'react-icons/fi';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  onClose?: () => void; // Prop opsional untuk menutup sidebar
}

const NavItem = ({ icon, label, isActive, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
    }`}
  >
    {icon}
    <span className="font-semibold">{label}</span>
  </button>
);

export default function Sidebar({ activePage, setActivePage, onClose }: SidebarProps) {
  return (
    <aside className="w-64 bg-gray-800 p-4 flex flex-col gap-4 text-white h-full">
      {/* Header dengan judul dan tombol tutup (hanya di mobile) */}
      <div className="flex justify-between items-center pt-2 pb-4">
        <h1 className="text-white text-2xl font-bold">
          DocuSearch
        </h1>
        {/* Tombol tutup, hanya tampil di mobile (md:hidden) */}
        <button onClick={onClose} className="md:hidden p-1 text-gray-400 hover:text-white">
          <FiX size={24} />
        </button>
      </div>

      <nav className="flex flex-col gap-2">
        <NavItem
          icon={<FiSearch size={20} />}
          label="Pencarian"
          isActive={activePage === 'pencarian'}
          onClick={() => setActivePage('pencarian')}
        />
        <NavItem
          icon={<FiUpload size={20} />}
          label="Upload"
          isActive={activePage === 'upload'}
          onClick={() => setActivePage('upload')}
        />
        <NavItem
          icon={<FiSettings size={20} />}
          label="Pengaturan"
          isActive={activePage === 'pengaturan'}
          onClick={() => setActivePage('pengaturan')}
        />
      </nav>
    </aside>
  );
}
