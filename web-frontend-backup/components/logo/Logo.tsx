import Link from 'next/link'
import React from 'react'

const Logo = () => {
  return (
    <Link href={'/'} className='flex items-center gap-1 mr-3 md:mr-0'>
        <span className='text-2xl font-black tracking-tight'>ZAYKAUR</span>
        <span className='text-3xl font-black text-pink-600'>.</span>
    </Link>
  )
}

export default Logo