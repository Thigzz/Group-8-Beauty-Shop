import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface AccountSettingsLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

const AccountSettingsLayout: React.FC<AccountSettingsLayoutProps> = ({ 
  children, 
  title, 
  description 
}) => {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            {description && (
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            )}
          </div>
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsLayout;