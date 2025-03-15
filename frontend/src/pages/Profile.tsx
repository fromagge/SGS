import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { RootState } from '@/store/store';
import User from '@/types/user';
import LoadingSpin from '@components/LoadingSpin';
import { logout } from '@store/authSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user: User | null = useSelector(
    (state: RootState) => state.auth.userData,
  );

  if (!user) {
    return <LoadingSpin />;
  }

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg mt-12">
      <div className="mb-6">
        <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-3 font-medium">
          Personal Information
        </h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">First Name</p>
              <p className="font-medium text-gray-800">{user.first_name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Last Name</p>
              <p className="font-medium text-gray-800">{user.last_name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-3 font-medium">
          Contact Information
        </h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="mb-4">
            <p className="text-xs text-gray-500">Email</p>
            <p className="font-medium text-gray-800">{user.contact_email}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="font-medium text-gray-800">{user.contact_phone}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Country Code</p>
              <p className="font-medium text-gray-800">{user.country_code}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Organization Details */}
      <div>
        <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-3 font-medium">
          Organization Details
        </h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Organization</p>
              <p className="font-medium text-gray-800">
                {user.organization_name}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Time Zone</p>
              <p className="font-medium text-gray-800">{user.time_zone_id}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <button
          className="w-full py-2 px-4 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 focus:outline-none focus:bg-red-600 cursor-pointer"
          onClick={() => {
            dispatch(logout());
            navigate('/');
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
