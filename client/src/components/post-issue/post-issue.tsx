import React from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

/* eslint-disable @typescript-eslint/no-misused-promises */
import { useMutation } from '@tanstack/react-query'

type NewIssue = {
  title: string
  description: string
}

function PostIssue() {
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<NewIssue>({
    defaultValues: {
      title: '',
      description: '',
    },
  })

  const postIssue = useMutation({
    mutationKey: ['postIssue'],
    mutationFn: async (params: NewIssue) => {
      try {
        await fetch('http://localhost:8080/v1/issues', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        })
      } catch (error) {
        console.log('error :>> ', error)
      }
    },
  })

  const onSubmit: SubmitHandler<NewIssue> = (data) => {
    postIssue.mutate(data)
  }

  return (
    <>
      <div className='mb-12'>
        <h2 className='text-xl'>Post New Issue</h2>
      </div>
      <div className='mb-12'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='mb-6'>
            <label htmlFor='title'>Title</label>
            <input
              className='border border-slate-300 rounded-md px-4 py-2'
              type='text'
              id='title'
              {...register('title')}
            />
            {errors.description ? <p>{errors.title?.message}</p> : null}
          </div>
          <div className='mb-6'>
            <label htmlFor='descrioption'>Description</label>
            <input
              className='border border-slate-300 rounded-md px-4 py-2'
              type='text'
              id='description'
              {...register('description')}
            />
            {errors.description ? <p>{errors.description?.message}</p> : null}
          </div>
          <div className='mb-6'>
            <button type='submit' className='bg-blue-400 px-4 py-2 rounded-md'>
              Create
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default PostIssue
