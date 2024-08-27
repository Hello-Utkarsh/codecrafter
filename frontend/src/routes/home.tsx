import AppBar from '@/components/AppBar'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  return (
    <div>
      <AppBar />
      <div className='px-16 py-6'>
        <div className='flex justify-between mt-4'>
          <h2 className='text-2xl font-medium tracking-wide'>Your Repls</h2>
          <Link to={'/repl/2'}>
            <button className='mr-4 h-fit bg-gray-100 text-black px-2 py-1 rounded-md hover:bg-gray-300'>Create Repl</button>
          </Link>
        </div>
        <div className='w-full mt-8 border-2 border-gray-300 px-5 rounded-md divide-y-2 divide-gray-300'>
          <div className='flex justify-between mx-auto items-center py-6'>
            <p>Name</p>
            <p className='max-w-[50%] truncate ...'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam eius recusandae nam sunt facilis officia veritatis sequi possimus hic rem.</p>
            <img className='h-4 cursor-pointer' src="/delete.png" alt="" />
          </div>
          <div className='flex justify-between mx-auto items-center py-6'>
            <p>Name</p>
            <p>Description</p>
            <img className='h-4 cursor-pointer' src="/delete.png" alt="" />
          </div>
          <div className='flex justify-between mx-auto items-center py-6'>
            <p>Name</p>
            <p>Description</p>
            <img className='h-4 cursor-pointer' src="/delete.png" alt="" />
          </div>
        </div>
      </div>
    </div>
  )
}
