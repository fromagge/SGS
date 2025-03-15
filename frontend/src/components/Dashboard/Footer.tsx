import React from 'react';

const DashboardFooter = () => {
  return (
    <footer className="fixed bottom-0 w-fulltext-white text-center py-5">
      <p className="text-sm font-bold">
        Made with <span className="text-red-500">&hearts;</span> by{' '}
        <a
          href="https://github.com/fromagge"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-500 hover:text-purble-700"
          title="a.k.a. Gabriel Garcia"
        >
          fromagge
        </a>
      </p>
    </footer>
  );
};

export default DashboardFooter;
