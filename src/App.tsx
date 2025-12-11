import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { MainLayout } from '@/components/layout'
import { Dashboard } from '@/pages/Dashboard'
import { ElderlyList } from '@/pages/ElderlyList'
import { ElderlyProfile } from '@/pages/ElderlyProfile'
import { CallHistory } from '@/pages/CallHistory'
import { CallDetail } from '@/pages/CallDetail'
import { IssuesList } from '@/pages/IssuesList'
import { Actions } from '@/pages/Actions'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/elderly" element={<ElderlyList />} />
            <Route path="/elderly/:id" element={<ElderlyProfile />} />
            <Route path="/calls" element={<CallHistory />} />
            <Route path="/calls/:id" element={<CallDetail />} />
            <Route path="/actions" element={<Actions />} />
            {/* <Route path="/issues" element={<IssuesList />} /> */}
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
