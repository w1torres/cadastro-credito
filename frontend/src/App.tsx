import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './features/auth/LoginPage'
import { RequireAuth } from './features/auth/RequireAuth'
import { RequireRole } from './features/auth/RequireRole'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { ClientsListPage } from './features/clients/ClientsListPage'
import { NewClientPage } from './features/clients/NewClientPage'
import { ClientDetailPage } from './features/clients/ClientDetailPage'
import { NewPropertyPage } from './features/properties/NewPropertyPage'
import { NewCreditRequestPage } from './features/credit-requests/NewCreditRequestPage'
import { EditClientRequestPage } from './features/credit-requests/EditClientRequestPage'
import { CreditRequestDetailPage } from './features/credit-requests/CreditRequestDetailPage'
import { UsersListPage } from './features/admin/UsersListPage'
import { NewUserPage } from './features/admin/NewUserPage'
import { EditUserPage } from './features/admin/EditUserPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route element={<RequireRole roles={['CONSULTOR', 'ADMIN']} />}>
            <Route path="/clients" element={<ClientsListPage />} />
            <Route path="/clients/new" element={<NewClientPage />} />
            <Route
              path="/clients/:clientId/properties/new"
              element={<NewPropertyPage />}
            />
            <Route
              path="/clients/:clientId/credit-requests/new"
              element={<NewCreditRequestPage />}
            />
            <Route
              path="/credit-requests/:id/edit"
              element={<EditClientRequestPage />}
            />
          </Route>

          <Route path="/clients/:id" element={<ClientDetailPage />} />
          <Route
            path="/credit-requests/:id"
            element={<CreditRequestDetailPage />}
          />

          <Route element={<RequireRole roles={['ADMIN']} />}>
            <Route path="/admin/users" element={<UsersListPage />} />
            <Route path="/admin/users/new" element={<NewUserPage />} />
            <Route path="/admin/users/:id/edit" element={<EditUserPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
