import { Editor } from '@monaco-editor/react';
import { useState } from 'react';
import { useLoaderData } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'


export default function Repl() {
    const [fileName, setFileName] = useState('script.js');

    const files: any = {
        'script.js': {
            name: 'script.js',
            language: 'javascript',
            value: "someJSCodeExample",
        },
        'style.css': {
            name: 'style.css',
            language: 'css',
            value: "someCSSCodeExample",
        },
        'index.html': {
            name: 'index.html',
            language: 'html',
            value: "someHTMLCodeExample",
        },
    };
    const file = files[fileName];

    const replID = useLoaderData()
    console.log(replID)
    return (
        <div className='flex flex-col py-4'>
            <div className='flex justify-between items-center px-6 my-2'>
                <div className='flex'>
                    <p className='mx-2 hover:cursor-pointer'>Home</p>
                    <p className='mx-2'>Repl Name</p>
                </div>
                <button className='px-3 py-1 bg-green-600 rounded-md hover:bg-green-700 flex items-center'><img className='h-3 mr-2' src="/run.png" alt="" />Run</button>
                <div className='flex bg-gray-100 px-2 py-1 rounded-md text-black font-medium hover:bg-gray-300'>
                    <SignedOut>
                        <SignInButton />
                    </SignedOut>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                </div>
            </div>
            <div className='flex w-full my-2'>
                <div className='flex flex-col w-2/12 items-start'>
                    <button className='cursor-pointer mx-1 my-1' disabled={fileName === 'script.js'} onClick={() => setFileName('script.js')}>
                        script.js
                    </button>
                    <button className='cursor-pointer mx-1 my-1' disabled={fileName === 'style.css'} onClick={() => setFileName('style.css')}>
                        style.css
                    </button>
                    <button className='cursor-pointer mx-1 my-1' disabled={fileName === 'index.html'} onClick={() => setFileName('index.html')}>
                        index.html
                    </button>
                </div>
                <Editor
                    theme='vs-dark' height='80vh' width='48vw'
                    path={file.name}
                    defaultLanguage={file.language}
                    defaultValue={file.value}
                    className='mx-2'
                />
                <div className='w-4/12 mx-2 bg-[#1e1e1e] px-4 py-2'>
                    <p className='text-sm'>&gt;&#95; Console</p>
                </div>
            </div>
        </div>
    )
}

export async function loader({ params }: any) {
    return await params.replID
}