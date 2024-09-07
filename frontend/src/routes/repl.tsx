import { Editor } from '@monaco-editor/react';
import { useEffect, useRef, useState } from 'react';
import { useLoaderData } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import { io } from "socket.io-client";
import { Socket } from 'node_modules/socket.io-client/build/cjs';
import { Button } from '@/components/ui/button';
import TerminalComponent from '@/components/TerminalComp';

export default function Repl() {
    const languages: any = { 'js': 'javascript', 'py': 'python' }
    const [defaultCode, setDefaultCode] = useState('')
    const [files, setFile] = useState(new Map<string, { extension: string; type: string }>())
    const [selectedFile, selectFile] = useState<string[]>([])

    const [socket, setSocket] = useState<Socket | null>(null)
    const replData: any = useLoaderData()

    useEffect(() => {
        const newSocket: any = io('http://localhost:3000')
        setSocket(newSocket)
        getDir(newSocket)
    }, [])

    const getDir = async (newSocket: Socket) => {
        if (newSocket) {
            newSocket?.emit('get-dir', replData[0], (res: any, err: any) => {
                if (res.status == 'ok') {
                    const dir: { file: string, fileType: string }[] = res.dir
                    const updatedFiles = new Map(files);
                    dir.forEach((file: any) => {
                        if (!updatedFiles.has(file.file)) {
                            updatedFiles.set(file.file, {
                                extension: languages[file.file.split('.')[1]],
                                type: file.fileType,
                            });
                        }
                    });
                    setFile(updatedFiles);
                    selectFile([Array.from(updatedFiles.entries())[0][1].extension, Array.from(updatedFiles.entries())[0][0]])
                    getSelectedFile(Array.from(updatedFiles.entries())[0][0], newSocket)
                } else {
                    console.log(err)
                }
            })
        }
    }

    const getSelectedFile = async (file: any, socket: Socket) => {
        if (socket && file != 'undefined') {
            console.log(replData[0], selectedFile)
            socket.emit('get-selected-file-code', { replName: replData[0], file: file }, (res: { status: string, fileContent: string }, err: any) => {
                if (res.status == 'ok') {
                    setDefaultCode(res.fileContent)
                }
            })
        }
    }

    const debounce = (value: any) => {
        let a: any
        return (args: any) => {
            clearTimeout(a);
            a = setTimeout(() => {
                value(args)
            }, 3000);
        }
    }

    const callDebounce = debounce((text: any) => { socket?.emit('code-editor-change', { replName: replData[0], file: selectedFile[1], code: text }) })

    return (
        <div className='flex flex-col py-4'>
            <div className='flex justify-between items-center px-6 my-2'>
                <div className='flex'>
                    <p className='mx-2 hover:cursor-pointer'>Home</p>
                    <p className='mx-2'>{replData[0]}</p>
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
                <div className='flex flex-col w-[12%] items-start'>
                    <div className='mx-4 flex justify-between mb-1'>
                        <p>Files</p>
                    </div>
                    {Array.from(files.entries()).length > 0 && Array.from(files.entries()).map(([name, value]: any) => {
                        return (
                            <Button value={name} onClick={(e: any) => {
                                selectFile([languages[e.target.value.split('.')[1]], e.target.value])
                                if (socket) {
                                    getSelectedFile(e.target.value, socket)
                                }
                            }} className='cursor-pointer w-full text-start justify-start bg-transparent py-1 h-fit rounded-none text-sm'>{name}</Button>
                        )
                    })}
                </div>
                <Editor
                    theme='vs-dark' height='80vh' width='40vw'
                    path={selectedFile[1]}
                    defaultLanguage={selectedFile[0]}
                    defaultValue={""}
                    className='mx-2'
                    value={defaultCode}
                    onChange={(value: any) => {
                        callDebounce(value)
                    }}
                />
                <TerminalComponent newSocket={socket} replData = {replData}/>
            </div>
        </div>
    )
}