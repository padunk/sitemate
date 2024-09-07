import React from 'react'

/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useQuery } from '@tanstack/react-query'

type Props = {}

export type Issue = {
  id: string
  title: string
  description: string
}

function AllIssue({}: Props) {
  const allIssues = useQuery({
    queryKey: ['getAllIssues'],
    queryFn: async () => {
      try {
        const res = await fetch('http://localhost:8080/v1/issues', {
          method: 'GET',
        })

        const data = await res.json()

        return data as Array<Issue>
      } catch (error) {
        console.log('error :>> ', error)
      }
    },
  })

  const status = allIssues.status
  return (
    <div>
      <h2>All Issues</h2>
      {status === 'success' ? (
        <div></div>
      ) : status === 'pending' ? (
        <div>Loading...</div>
      ) : (
        <div>Error getting issues</div>
      )}
    </div>
  )
}

export default AllIssue
