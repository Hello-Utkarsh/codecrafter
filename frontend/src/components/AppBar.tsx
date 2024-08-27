import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'

export default function AppBar() {
    return (
        <div className='h-full flex justify-between border-b-2 border-gray-300 px-6 py-4'>
            <h1 className='font-mono font-semibold text-[26px]'>Replit</h1>
            <div className='flex bg-gray-100 px-2 py-1 rounded-md text-black font-medium hover:bg-gray-300'>
                <SignedOut>
                    <SignInButton />
                </SignedOut>
                <SignedIn>
                    <UserButton />
                </SignedIn>
            </div>
        </div>
    )
}
