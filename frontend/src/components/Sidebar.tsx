// file: frontend/src/components/Sidebar.tsx
import { FiSearch, FiUpload, FiSettings } from 'react-icons/fi';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
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

export default function Sidebar({ activePage, setActivePage }: SidebarProps) {
  return (
    <aside className="w-64 bg-gray-800 p-4 flex flex-col gap-8 text-white">
      <div className="text-2xl font-bold text-center py-4">
        DocuSearch
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