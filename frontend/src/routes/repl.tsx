import { Editor } from '@monaco-editor/react';
import { useEffect, useRef, useState } from 'react';
import { useLoaderData } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import { io } from "socket.io-client";
import { Socket } from 'node_modules/socket.io-client/build/cjs';
import { Button } from '@/components/ui/button';
import TerminalComponent from '@/components/TerminalComp';

export default function Repl() {
    const languages: any = { '.js': 'javascript', '.py': 'python', '.json': 'json' }
    const [defaultCode, setDefaultCode] = useState('')
    const [render, setRender] = useState(true)
    // all the fetched files of the repl
    const [files, setFile]: any = useState([])
    const [sidebarDir, setSideBar]: any = useState([])
    const [selectedFile, selectFile] = useState<string[]>([])

    const [socket, setSocket] = useState<Socket | null>(null)
    const replData: any = useLoaderData()

    useEffect(() => {
        const newSocket: any = io('http://localhost:3000')
        newSocket.on('dir-change', (dir: any) => {
            const dummyFiles: any = []
            dir.map((x: { file: string, fileType: string }) => {
                if (x.fileType == 'dir') {
                    dummyFiles[x.file] = { ext: 'dir', status: 'close', children: [] }
                    return
                }
                dummyFiles[x.file] = { ext: x.fileType }
            })
            setFile(dummyFiles)
        })
        setSocket(newSocket)
        getDir(newSocket)
    }, [])

    const getDir = async (newSocket: Socket) => {
        if (newSocket) {
            newSocket?.emit('get-dir', replData[0], (res: { content: { file: string, fileType: string }[], type: string }, err: any) => {
                if (files) {
                    const dummyFiles: any = []
                    res.content.map((x: { file: string, fileType: string }) => {
                        if (x.fileType == 'dir') {
                            dummyFiles[x.file] = { ext: 'dir', status: 'close', children: [] }
                            return
                        }
                        dummyFiles[x.file] = { ext: x.fileType }
                    })
                    setFile(dummyFiles)
                    getSelectedFile(res.content[0].file, newSocket)
                }
            })
        }
    }

    const recSearch = (path: any, content: any, data?: any,) => {
        if (path.length == 1) {
            const dir = path[0]
            const a = { [path[0]]: { ext: 'dir', status: 'open', children: content } }
            console.log(a)
            return a
        }
        const a = { [path[0]]: { ext: 'dir', status: 'open', children: [recSearch(path.slice(1), content, data), ...data[path[0]].children.filter(x => x.file != path[1])] } }
        return a
    }

    const [a, seta]: any = useState()
    let dir = []
    const getSelectedFile = async (file: any, socket: Socket) => {
        let path = ""
        if (sidebarDir.length > 0) {
            sidebarDir.map((x: any) => path += `/${x}/${file}`)
        }
        if (sidebarDir.length == 0) {
            path += `/${file}`
        }
        console.log(path)
        if (path) {
            socket.emit('searchDir', path, replData[0], (res: { content: { fileContent: string, ext: string }, type: string }, err: any) => {
                if (err) {
                    console.log(err)
                }

                if (res.type == 'file' && typeof res.content.fileContent == 'string') {
                    selectFile([languages[res.content.ext], file])
                    setDefaultCode(res.content.fileContent)
                    return
                }
                if (res.type == 'dir') {
                    const dummyFiles = files
                    const x: any = recSearch(path.split('/').slice(1), res.content, dummyFiles)
                    dummyFiles[Object.keys(x)[0]] = x[Object.keys(x)[0]]
                    setFile(dummyFiles)
                    setRender(prev => !prev)
                    seta(res.content)
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

    const callDebounce = debounce((text: any) => {
        let path = ""
        if (sidebarDir.length > 0) {
            sidebarDir.map((x: any) => path += `/${x}/${selectedFile[1]}`)
        }
        if (sidebarDir.length == 0) {
            path += `/${selectedFile[1]}`
        }
        socket?.emit('code-editor-change', { replName: replData[0], file: selectedFile[1], code: text })
    })

    const renderFolder = (files: any) => {
        if (files.status == 'open' && files.children) {
            return (
                <>
                    {files.children.map((tab: any) => {
                        return (
                            <div>
                                <Button value={tab.file} onClick={async (e: any) => {
                                    if (files.ext == 'dir' && socket) {
                                        getSelectedFile(e.target.value, socket)
                                        return
                                    }
                                    if (socket) {
                                        getSelectedFile(e.target.value, socket)
                                    }
                                }} className='cursor-pointer w-full text-start justify-start bg-transparent py-1 h-fit rounded-none text-sm'>{tab.file || Object.keys(tab)[0]}</Button>
                                <div className='ml-2'>
                                    {files.ext == 'dir' ? renderFolder(tab) : null}
                                </div>
                            </div>
                        )
                    })}
                </>
            )
        }
        if (files.file && files.fileType) {
            return
        }
        if (Object.keys(files)[0] != 'file' && Object.keys(files)[1] != 'filetype') {
            if (files[Object.keys(files)[0]].status == 'open') {
                return (
                    <>
                        {files[Object.keys(files)[0]].children.map((x: any) => {
                            return (
                                <div>
                                    <Button value={x.file} onClick={async (e: any) => {
                                        if (files.ext == 'dir' && socket) {
                                            getSelectedFile(e.target.value, socket)
                                            return
                                        }
                                        if (socket) {
                                            getSelectedFile(e.target.value, socket)
                                        }
                                    }} className='cursor-pointer w-full text-start justify-start bg-transparent py-1 h-fit rounded-none text-sm'>{x.file}</Button>
                                    <div className='ml-2'>
                                        {files.ext == 'dir' ? renderFolder(x) : null}
                                    </div>
                                </div>
                            )
                        })}
                    </>
                )
            }
        }
    }

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
                <div className='flex flex-col w-[12%] items-start overflow-y-scroll h-[80vh]'>
                    <div className='mx-4 flex justify-between mb-1'>
                        <p>Files</p>
                    </div>
                    {Object.keys(files).length > 0 && Object.keys(files).map((name: string) => {
                        return (
                            <div>
                                <Button value={name} onClick={async (e: any) => {
                                    if (files[name].status == 'open') {
                                        const dummyFiles = files
                                        dummyFiles[name].status = 'close'
                                        setFile(dummyFiles)
                                        setRender(prev => !prev)
                                        return
                                    }
                                    if (files[name].ext == 'dir' && socket) {
                                        setSideBar((prev: string) => [...prev, e.target.value])
                                        getSelectedFile(e.target.value, socket)
                                        return
                                    }
                                    if (socket) {
                                        getSelectedFile(e.target.value, socket)
                                    }
                                }
                                } className='cursor-pointer w-full text-start justify-start bg-transparent py-1 h-fit rounded-none text-sm'>{name}</Button>
                                <div className='ml-2'>
                                    {files[name].ext == 'dir' ? renderFolder(files[name]) : null}
                                </div>
                            </div>
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
                <TerminalComponent newSocket={socket} replData={replData} />
            </div>
        </div>
    )
}