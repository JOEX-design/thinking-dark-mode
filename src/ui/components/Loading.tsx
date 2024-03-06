import * as React from 'react'

export const Loading = ({text}) => {
    return (

        <div className='h-fill w-full flex items-center justify-center'>
            <div role="status" className='flex flex-col item-center'>
            <div className='border-slate-300 h-10 w-10 animate-spin rounded-full border-4 border-t-purple-500'>
                </div>
                <span className="text-sm text-slate-500 font-normal mt-2">{text}</span>
            </div>
        </div>
        )
    }
    