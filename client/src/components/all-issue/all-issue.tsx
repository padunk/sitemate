/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import React from 'react'

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

type Props = {}

export type Issue = {
  id: string
  title: string
  description: string
}

function AllIssue({}: Props) {
  const query = useQueryClient()

  const allIssues = useQuery({
    queryKey: ['getAllIssues'],
    queryFn: async () => {
      try {
        const res = await fetch('http://localhost:8080/v1/issues', {
          method: 'GET',
        })

        const data = await res.json()

        return data.issues as Array<Issue>
      } catch (error) {
        console.log('error :>> ', error)
      }
    },
  })

  const status = allIssues.status

  const updateIssue = useMutation({
    mutationKey: ['deleteIssue'],
    mutationFn: async ({ id, data }: { id: string; data: Issue }) => {
      try {
        await fetch(`http://localhost:8080/v1/issues/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
        await query.invalidateQueries({
          queryKey: ['getAllIssues'],
        })
      } catch (error) {
        console.log('error :>> ', error)
      }
    },
  })

  const deleteIssue = useMutation({
    mutationKey: ['deleteIssue'],
    mutationFn: async (id: string) => {
      try {
        await fetch(`http://localhost:8080/v1/issues/${id}`, {
          method: 'DELETE',
        })
        await query.invalidateQueries({
          queryKey: ['getAllIssues'],
        })
      } catch (error) {
        console.log('error :>> ', error)
      }
    },
  })

  const handleDelete = (id: string) => {
    deleteIssue.mutate(id)
  }

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>, id: string) => {
    e.preventDefault()
    const data = {
      id,
      title: e.target.elements['issue-title'].value,
      description: e.target.elements['issue-description'].value,
    }
    updateIssue.mutate({ id, data })
  }

  console.log('allIssues :>> ', allIssues.data)

  return (
    <div>
      <h2 className='text-2xl'>All Issues</h2>
      {status === 'success' ? (
        <div>
          {allIssues.data && allIssues.data?.length > 0 ? (
            <ul>
              {allIssues.data.map((issue) => {
                return (
                  <li key={issue.id}>
                    <form onSubmit={(event) => handleUpdate(event, issue.id)}>
                      <input
                        type='text'
                        name='issue-title'
                        defaultValue={issue.title}
                      />
                      <input
                        type='text'
                        name='issue-description'
                        defaultValue={issue.description}
                      />
                      <button type='submit'>Update</button>
                    </form>
                    <div>
                      <button
                        type='button'
                        onClick={() => handleDelete(issue.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div>No Issues, please create one</div>
          )}
        </div>
      ) : status === 'pending' ? (
        <div>Loading...</div>
      ) : (
        <div>Error getting issues</div>
      )}
    </div>
  )
}

export default AllIssue
