/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import './App.css'

import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import AllIssue from './components/all-issue/all-issue'
import PostIssue from './components/post-issue/post-issue'

function App() {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnMount: false,
            refetchOnReconnect: true,
            refetchOnWindowFocus: true,
            retry: 3,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <div className='m-24'>
        <header>
          <div className='mb-24'>
            <h1 className='text-3xl'>Sitemate Issue</h1>
          </div>
        </header>

        <main>
          <div className='mb-24'>
            <PostIssue />
          </div>

          <div className='mb-24'>
            <AllIssue />
          </div>
        </main>
      </div>
    </QueryClientProvider>
  )
}

export default App
