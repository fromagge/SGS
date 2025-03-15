import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { logout } from '@/store/authSlice';
import { RootState } from '@/store/store';
import LoadingSpin from '@/components/LoadingSpin';

const DashboardHeader = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.userData);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getUserFullName = () => {
    return `${user?.first_name} ${user?.last_name}`;
  };

  return (
    <div className="relative py-4 flex justify-between items-center">
      <div
        className="text-black text-4xl font-bold flex items-center h-12 cursor-pointer"
        onClick={() => navigate('/')}
      >
        Dashboard
      </div>
      <div className="relative">
        <button
          className="text-black focus:outline-none flex items-center gap-2 px-5 py-2 border border-gray-300 rounded-md hover:bg-gray-50 h-12 max-w-60 min-w-40"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          {user ? (
            <>
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-sm">
                {user?.first_name?.charAt(0)}
              </span>
              <span className="font-medium truncate max-w-[80%]">
                {getUserFullName()}
              </span>
            </>
          ) : (
            <LoadingSpin />
          )}
        </button>

        <UserDropdown isOpen={isDropdownOpen} setIsOpen={setIsDropdownOpen} />
      </div>
    </div>
  );
};

const UserDropdown = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  if (!isOpen) return <></>;

  return (
    <div
      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2"
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className="block px-4 py-2 text-gray-800 hover:bg-gray-200 w-full text-left cursor-pointer"
        onClick={() => handleProfile()}
      >
        Profile
      </button>
      <button
        className="block px-4 py-2 text-gray-800 hover:bg-gray-200 w-full text-left cursor-pointer"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
};

export default DashboardHeader;
