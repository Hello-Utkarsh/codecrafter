import { SignedIn, SignedOut, SignInButton, UserButton, useSession } from '@clerk/clerk-react'
import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function AppBar() {
    const navigate = useNavigate()
    const session = useSession()
    useEffect(() => {
        if (!session.isSignedIn) {
            navigate('/')
        }
    }, [])
    return (
        <div className='h-full flex justify-between border-b-2 border-gray-800 px-6 py-4'>
            <Link to={'/dashboard'}><h1 className='font-mono font-semibold text-[26px]'> <span className='text-blue-400 mr-2'>&lt;&gt;</span>CodeCraft</h1></Link>
            {!session.isSignedIn ? <div className='flex text-white px-2 py-1 rounded-md font-medium'>
                <p className='mx-4'>Features</p>
                <p className='mx-4'>Pricing</p>
                <p className='mx-4'>Blogs</p>
            </div> : <div className='flex px-2 py-1 rounded-md text-black font-medium'>
                <SignedOut>
                    <SignInButton />
                </SignedOut>
                <SignedIn>
                    <UserButton />
                </SignedIn>
            </div>}
        </div>
    )
}
