import { useAuth } from '../../hooks/useAuth';

export function Navbar() {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6">
      {user && (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-700 text-sm font-medium">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-sm text-gray-700">{user.name}</span>
        </div>
      )}
    </header>
  );
}
