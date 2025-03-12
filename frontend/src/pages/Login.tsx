import React from 'react';
import HomeFooter from '@/components/HomeFooter';

const Login = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen w-full">
      <div className="flex flex-col justify-center items-center h-auto w-full mt-[-200px]">
        <div className="flex flex-col justify-center items-center mb-50">
          <div className="overflow-hidden h-[65px] w-full flex justify-center">
            <img
              src="https://socialgoodsoftware.com/wp-content/themes/altru/images/logo.png"
              alt="SGS Contacts"
            />
          </div>
          <p className="text-sm mb-2 font-semibold text-gray-300 ">
            Your best app to manage your contacts
          </p>
        </div>
        <div className="flex flex-col justify-center items-center">
          <p className="text-sm mb-2 font-semibold text-gray-500">Login with</p>
          <div className="min-w-[300px] bg-purple-400 p-4 rounded-md cursor-pointer hover:bg-purple-500">
            <img
              src="https://developer.constantcontact.com/images/ctct_ripple_logo_horizontal_white.svg"
              alt="Login with Constant Contact"
            />
          </div>
        </div>
        <p className="text-sm mb-2 font-semibold text-gray-500 mt-2">
          Don't have an account?{' '}
          <a className="text-purple-500" href="mailto:ygabo@pm.me">
            Email us
          </a>
        </p>
      </div>
      <div className="fixed bottom-0 w-full">
        <HomeFooter />
      </div>
    </div>
  );
};

export default Login;
