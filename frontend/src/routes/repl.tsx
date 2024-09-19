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
                    dummyFiles[x.file] = { fileType: 'dir', status: 'close', children: [] }
                    return
                }
                dummyFiles[x.file] = { fileType: x.fileType }
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
                            dummyFiles[x.file] = { fileType: 'dir', status: 'close', children: [] }
                            return
                        }
                        dummyFiles[x.file] = { fileType: x.fileType }
                    })
                    setFile(dummyFiles)
                    getSelectedFile(res.content[0].file, newSocket)
                }
            })
        }
    }

    // recursive function to set new dir in the files
    const recSearch = (path: any, content: any, status: string, data?: any) => {
        let newPath = ""

        // if path length is greater than 1, it means gotta go more deep in the file tree
        if (path.length == 1) {
            const a = { [path[0]]: { fileType: 'dir', status: status, children: content } }
            return a
        }
        
        // delete the dir which has been clicked to close and create a new one with "close" status
        if (status == 'close') {
            data = data[path[0]]?.children.filter(x => Object.keys(x)[0] != path[1])
        }

        newPath += `/${path[0]}`
        const secData = data[path[0]] || data.children
        const bc = (data[path[0]] ? data[path[0]].children : data)
        console.log(data, secData, bc)
        const a = { [path[0]]: { fileType: 'dir', status: 'open', children: [recSearch(path.slice(1), content, status, secData), ...bc.children.filter(x => x.file != path[1])] } }
        console.log(a)
        return a
    }

    const getSelectedFile = async (file: any, socket: Socket, fileType?: string) => {
        let path = ""
        // if (file.length > 0) {
        //     file.map((x: any) => path += `/${x}`)
        // }
        // if (file.length == 0) {
        //     path += `/${file}`
        // }
        console.log(file)
        if (file) {
            socket.emit('searchDir', file, replData[0], (res: { content: { fileContent: string, fileType: string }, type: string }, err: any) => {
                if (err) {
                    console.log(err)
                }
                console.log(res.content)

                // if the response if of type file, set the defaultCode with gets displayed in the editor to the reposnse code
                if (res.type == 'file' && typeof res.content.fileContent == 'string') {
                    selectFile([languages[res.content.fileType], file])
                    setDefaultCode(res.content.fileContent)
                    return
                }

                // if the response if of type dir, send it to resSearch to set it in the correct folder using recursion
                if (res.type == 'dir') {
                    const dummyFiles = files
                    const x: any = recSearch(file.split('/').slice(1), res.content, 'open', dummyFiles)
                    dummyFiles[Object.keys(x)[0]] = x[Object.keys(x)[0]]
                    console.log(dummyFiles)
                    setFile(dummyFiles)
                    setRender(prev => !prev)
                }
            })
        }
    }

    // wait for 3 sec before sending the code changes
    const debounce = (value: any) => {
        let a: any
        return (args: any) => {
            clearTimeout(a);
            a = setTimeout(() => {
                value(args)
            }, 3000);
        }
    }

    const callDebounce = debounce((value: any) => {
        let path = ""
        if (sidebarDir.length > 0) {
            sidebarDir.map((x: any) => path += `/${x}/${selectedFile[1]}`)
        }
        if (sidebarDir.length == 0) {
            path += `/${selectedFile[1]}`
        }
        socket?.emit('code-editor-change', { replName: replData[0], file: selectedFile[1], code: value })
    })

    // recursive function which takes file details and display the sub folders
    const renderFolder = (nestedfiles: any) => {
        if ((nestedfiles.status == 'open' && nestedfiles.children) || nestedfiles[Object.keys(nestedfiles)[0]].status == 'open') {
            return (
                <>
                    {(nestedfiles.children || nestedfiles[Object.keys(nestedfiles)[0]].children).map((tab: any) => {
                        return (
                            <div>
                                <Button value={(tab.file || Object.keys(tab)[0])} onClick={async (e: any) => {
                                    if ((tab.fileType == 'dir' || tab[Object.keys(tab)[0]].fileType == 'dir') && socket) {
                                        if (tab.status == 'open' || tab[Object.keys(tab)[0]].fileType == 'dir') {
                                            let path = ""
                                            console.log(e.target.value)
                                            if (sidebarDir.length > 0) {
                                                sidebarDir.map((x: any) => path += `/${x}/${e.target.value}`)
                                            }
                                            if (sidebarDir.length == 0) {
                                                path += `/${e.target.value}`
                                            }
                                            const a = recSearch(path.split('/').slice(1), tab[Object.keys(tab)[0]].children, 'close', files)
                                            const dummyFiles = files
                                            dummyFiles[Object.keys(a)[0]] = a[Object.keys(a)[0]]
                                            setFile(dummyFiles)
                                            setRender(prev => !prev)
                                            return
                                        }
                                        let path = "";
                                        const newSidebarDir = [...sidebarDir, e.target.value];
                                        newSidebarDir.forEach((x: any) => path += `/${x}`);
                                        setSideBar(newSidebarDir)
                                        getSelectedFile(path, socket, tab.fileType)
                                        setRender(prev => !prev)
                                        return
                                    }
                                    if (socket) {
                                        getSelectedFile(e.target.value, socket)
                                    }
                                }} className='cursor-pointer w-full text-start justify-start bg-transparent py-1 h-fit rounded-none text-sm'>{tab.file || Object.keys(tab)[0]}</Button>
                                <div className='ml-2'>
                                    {nestedfiles.fileType == 'dir' ? renderFolder(tab) : null}
                                </div>
                            </div>
                        )
                    })}
                </>
            )
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
                                    console.log("hello from here not there")
                                    if (files[name].status == 'open') {
                                        const dummyFiles = files
                                        dummyFiles[name].status = 'close'
                                        setFile(dummyFiles)
                                        setRender(prev => !prev)
                                        return
                                    }
                                    if (files[name].fileType == 'dir' && socket) {
                                        let path = "";
                                        const newSidebarDir = [...sidebarDir, e.target.value];
                                        newSidebarDir.forEach((x: any) => path += `/${x}`);
                                        setSideBar(newSidebarDir)
                                        getSelectedFile(path, socket, files[name].fileType)
                                        getSelectedFile(e.target.value, socket)
                                        return
                                    }
                                    if (socket) {
                                        getSelectedFile(e.target.value, socket)
                                    }
                                }
                                } className='cursor-pointer w-full text-start justify-start bg-transparent py-1 h-fit rounded-none text-sm'>{name}</Button>
                                <div className='ml-2'>
                                    {files[name].fileType == 'dir' ? renderFolder(files[name]) : null}
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