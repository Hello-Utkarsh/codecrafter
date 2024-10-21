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
        window.addEventListener('beforeunload', () => {
            console.log("object")
        })
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
    const recSearch = (path: any, status: string, content?: any, data?: any) => {
        if (path.length == 1 && status == 'open') {
            const dummyFiles = { [path[0]]: { fileType: 'dir', status: 'open', children: content } }
            return dummyFiles
        }
        if (path.length == 1 && status == 'close') {
            console.log(data, path[0])
            const dummyfiles = (data.children || data[path[0]].children).filter(x => Object.keys(x)[0] == path[0])
            const newDummyfile = {[path[0]]: {fileType: dummyfiles[0][path[0]].fileType, status: status, children: dummyfiles[0][path[0]].children}}
            console.log(newDummyfile)
            return newDummyfile
        }

        const nestedData = data[path[0]] || data.children?.filter(x => Object.keys(x)[0] == path[0])[0][path[0]]
        const nestedPath = path.slice(1)
        console.log(data, "received", nestedData, "passed")
        const dummyFiles: any = { [path[0]]: { fileType: 'dir', status: 'open', children: [recSearch(nestedPath, status, content, nestedData), ...nestedData.children.filter(x => ((x.file || Object.keys(x)[0]) != path[1]))] } }
        return dummyFiles
    }

    const getSelectedFile = async (path: any, socket: Socket, fileType?: string) => {
        if (path) {
            socket.emit('searchDir', path, replData[0], (res: { content: { fileContent: string, fileType: string }, type: string }, err: any) => {
                if (err) {
                    console.log(err)
                }
                console.log(res)

                // if the response if of type file, set the defaultCode with gets displayed in the editor to the reposnse code
                if (res.type == 'file' && typeof res.content.fileContent == 'string') {
                    selectFile([languages[res.content.fileType], path])
                    setDefaultCode(res.content.fileContent)
                    return
                }

                // if the response if of type dir, send it to resSearch to set it in the correct folder using recursion
                if (res.type == 'dir') {
                    const dummyFiles = files
                    const nested_path = path.split('/')
                    const x: any = recSearch(path.split('/').splice(1), 'open', res.content, dummyFiles)
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
    const renderFolder = (nestedfiles: any, path?: any) => {
        if (nestedfiles[path[0]]?.status == 'open' || nestedfiles.fileType == 'file') {
            const newPath = path.slice(1)
            return (
                <>
                    {(nestedfiles.children || nestedfiles[path[0]].children).map(x => {
                        return (
                            <div>
                                <Button value={x.file} onClick={(e: any) => {
                                    if (socket) {
                                        if (x[Object.keys(x)[0]].status == 'open') {
                                            const dummyFiles = {...files}
                                            console.log(dummyFiles)
                                            const newDummyfile = recSearch(sidebarDir, 'close', "", dummyFiles)
                                            dummyFiles[Object.keys(newDummyfile)[0]] = newDummyfile[Object.keys(newDummyfile)[0]]
                                            const oldPath = sidebarDir
                                            const newPath =oldPath.splice(0,oldPath.indexOf(Object.keys(x)[0]))
                                            setSideBar(newPath)
                                            setFile(dummyFiles)
                                            return
                                        }
                                        let filePath = ''
                                        const newSidebarDir = [...sidebarDir, e.target.value];
                                        newSidebarDir.map(x => filePath += `/${x}`)
                                        getSelectedFile(filePath, socket)
                                        setSideBar(newSidebarDir)
                                    }
                                }} className='cursor-pointer w-full text-start justify-start bg-transparent py-1 h-fit rounded-none text-sm'>{x.file || Object.keys(x)[0]}</Button>
                                <div className='ml-2'>
                                    {x[Object.keys(x)[0]].fileType == 'dir' ? renderFolder(x, newPath) : null}
                                    {/* {nestedfiles.fileType == 'dir' ? renderFolder(tab) : null} */}
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
                                    if (files[name].status == 'open') {
                                        const newSidebarDir = sidebarDir.slice(0, sidebarDir.indexOf(name))
                                        setSideBar(newSidebarDir)
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
                                        // getSelectedFile(e.target.value, socket)
                                        return
                                    }
                                    if (socket) {
                                        getSelectedFile(e.target.value, socket)
                                    }
                                }
                                } className='cursor-pointer w-full text-start justify-start bg-transparent py-1 h-fit rounded-none text-sm'>{name}</Button>
                                <div className='ml-2'>
                                    {files[name].fileType == 'dir' ? renderFolder(files, sidebarDir) : null}
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