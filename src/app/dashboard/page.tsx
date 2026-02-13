/**
 * Dashboard Page
 *
 * Main dashboard for authenticated users
 * Shows different content based on user role
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SignOutButton } from '@/components/auth/signout-button'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const { user } = session

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Koppling</h1>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">
                {user.email}
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to Koppling
              </h2>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Your account information:
                    </p>
                    <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
                      <li><strong>Email:</strong> {user.email}</li>
                      <li><strong>Role:</strong> {user.role}</li>
                      <li><strong>Tenant ID:</strong> {user.tenantId || 'None (Platform Admin)'}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {user.role === 'platform_admin' && (
                <div className="bg-purple-50 border-l-4 border-purple-400 p-4 mb-6">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-purple-700">
                        <strong>Platform Admin Access</strong>
                      </p>
                      <p className="mt-2 text-sm text-purple-700">
                        You have full access to all platform features and all tenant data.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {user.role === 'platform_admin' && (
                    <a
                      href="/admin"
                      className="relative block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <h4 className="text-lg font-semibold text-gray-900">Admin Dashboard</h4>
                      <p className="mt-2 text-sm text-gray-600">
                        Manage tenants, platform settings, and blog
                      </p>
                    </a>
                  )}

                  {user.tenantId && (
                    <>
                      <div className="relative block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                        <h4 className="text-lg font-semibold text-gray-900">Integrations</h4>
                        <p className="mt-2 text-sm text-gray-600">
                          Connect Fortnox and Shopify accounts
                        </p>
                      </div>

                      <div className="relative block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                        <h4 className="text-lg font-semibold text-gray-900">Orders</h4>
                        <p className="mt-2 text-sm text-gray-600">
                          View and manage synced orders
                        </p>
                      </div>

                      <div className="relative block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                        <h4 className="text-lg font-semibold text-gray-900">Products</h4>
                        <p className="mt-2 text-sm text-gray-600">
                          View and manage synced products
                        </p>
                      </div>

                      <div className="relative block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                        <h4 className="text-lg font-semibold text-gray-900">Sync Settings</h4>
                        <p className="mt-2 text-sm text-gray-600">
                          Configure synchronization preferences
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {!user.tenantId && user.role !== 'platform_admin' && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        <strong>No Tenant Associated</strong>
                      </p>
                      <p className="mt-2 text-sm text-yellow-700">
                        Your account is not associated with a tenant. Please contact support.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
