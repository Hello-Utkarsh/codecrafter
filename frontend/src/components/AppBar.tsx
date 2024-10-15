import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react'

export default function AppBar() {
    const user = useUser()
    return (
        <div className='h-full flex justify-between border-b-2 border-gray-800 px-6 py-4'>
            <h1 className='font-mono font-semibold text-[26px]'> <span className='text-blue-400 mr-2'>&lt;&gt;</span>CodeCraft</h1>
            {!user.user ? <div className='flex text-white px-2 py-1 rounded-md font-medium'>
                <p className='mx-4'>Features</p>
                <p className='mx-4'>Pricing</p>
                <p className='mx-4'>Blogs</p>
            </div> : <div className='flex bg-gray-100 px-2 py-1 rounded-md text-black font-medium hover:bg-gray-300'>
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
