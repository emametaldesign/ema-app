import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { DashboardPage } from './pages/DashboardPage'
import { CalculationPage } from './pages/CalculationPage'
import { MeasurementPage } from './pages/MeasurementPage'
import { PlaceholderPage } from './pages/PlaceholderPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route
          path="kunden"
          element={<PlaceholderPage eyebrow="Kontakte" title="Kunden" description="Kunden, Ansprechpartner und Projekte zentral im Blick behalten." />}
        />
        <Route
          path="aufmass"
          element={<MeasurementPage />}
        />
        <Route
          path="kalkulation"
          element={<CalculationPage />}
        />
        <Route
          path="angebote"
          element={<PlaceholderPage eyebrow="Vertrieb" title="Angebote" description="Angebote erstellen, organisieren und ihren aktuellen Status einsehen." />}
        />
        <Route
          path="einstellungen"
          element={<PlaceholderPage eyebrow="Administration" title="Einstellungen" description="Persönliche Angaben und Unternehmensoptionen zentral verwalten." />}
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
