import { useState } from 'react'
import { Shield, Users, Lock, Settings, Key } from 'lucide-react'
import RoleManagement from './RoleManagement'
import UserRoleAssignment from '../components/UserRoleAssignment'
import PermissionsPanel from '../components/PermissionsPanel'

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('roles')

  const tabs = [
    {
      id: 'roles',
      label: 'Role Management',
      icon: Shield,
      component: RoleManagement,
    },
    {
      id: 'assignment',
      label: 'User Assignment',
      icon: Users,
      component: UserRoleAssignment,
    },
    {
      id: 'permissions',
      label: 'Permissions',
      icon: Key,
      component: PermissionsPanel,
    },
  ]

  const activeTabData = tabs.find((tab) => tab.id === activeTab)
  const Component = activeTabData?.component

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <div className="p-2 sm:p-3 bg-primary-blue/10 rounded-lg flex-shrink-0">
          <Lock className="text-primary-blue" size={24} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-dark">Admin Panel</h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">Manage roles, permissions, and user access</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-card-white rounded-custom shadow-custom overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-200 -mx-3 sm:-mx-4 lg:-mx-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 lg:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-blue text-primary-blue bg-blue-50'
                    : 'border-transparent text-text-muted hover:text-text-dark'
                }`}
              >
                <Icon size={16} className="hidden sm:inline" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="p-3 sm:p-4 lg:p-6">
          {activeTab === 'roles' && <Component />}
          {activeTab === 'assignment' && <Component />}
          {activeTab === 'permissions' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-text-dark mb-2">Available Permissions</h2>
                <p className="text-text-muted mb-6">
                  Select which permissions should be available for roles
                </p>
                <PermissionsPanel permissions={[]} onPermissionsChange={() => {}} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
