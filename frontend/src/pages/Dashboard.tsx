import { useLocation } from 'react-router-dom';

import DashboardHeader from '@/components/Dashboard/Header';
import DashboardFooter from '@/components/Dashboard/Footer';
import ContactList from '@/components/Dashboard/ContactList';
import Profile from '@/pages/Profile';

type DashboardProps = {
  view: 'dashboard' | 'profile';
};

const Dashboard: React.FC<DashboardProps> = ({ view: propView }) => {
  const location = useLocation();
  const view = location.state?.view || propView;

  return (
    <div className="p-8 flex justify-center">
      <div className="w-full max-w-2xl">
        <DashboardHeader />
        {view === 'profile' && <Profile />}
        {view === 'dashboard' && <ContactList />}
      </div>
      <DashboardFooter />
    </div>
  );
};

export default Dashboard;
