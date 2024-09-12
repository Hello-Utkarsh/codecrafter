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
    const [searchDir, setSearchDir] = useState<string[]>([])
    // all the fetched files of the repl
    const [files, setFile]: any = useState([])
    const [sidebarDir, setSideBar]: any = useState()
    const [selectedFile, selectFile] = useState<string[]>([])

    const [socket, setSocket] = useState<Socket | null>(null)
    const replData: any = useLoaderData()

    useEffect(() => {
        const newSocket: any = io('http://localhost:3000')
        // newSocket.on('dir-change', (dir: any) => {
        //     const updatedFiles = new Map(files);
        //     dir.forEach((file: any) => {
        //         if (!updatedFiles.has(file.file)) {
        //             updatedFiles.set(file.file, {
        //                 extension: languages[file.file.split('.')[1]],
        //                 type: file.fileType,
        //             });
        //         }
        //     });
        //     setFile(updatedFiles);
        // })
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

    let dir = []
    const getSelectedFile = async (file: any, socket: Socket) => {
        dir.push(file)
        let path = ""
        dir.map(x => path += `/${x}`)
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
                    dummyFiles[file]['children'] = res.content
                    setFile(dummyFiles)
                }
                // const dummyFiles = new Map(files)
                // dummyFiles.set(file, res.content)
                // const a = dummyFiles.get(file)
                // console.log(a.find((x: any) => x == '.bin'))
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

    const renderFolder = (name: string) => {
        if (files[name].status == 'open' && files[name].children) {
            console.log("object")
            return files[name].children.map((tab: any) => {
                console.log(tab.file)
                return (
                    <div>
                        <Button value={tab.file} onClick={async (e: any) => {
                        }} className='cursor-pointer w-full text-start justify-start bg-transparent py-1 h-fit rounded-none text-sm'>{tab.file}</Button>
                    </div>
                )
            })
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
                                    if (files[name].ext == 'dir' && socket) {
                                        const dummyFiles = files
                                        files[name]['status'] = 'open'
                                        setFile(dummyFiles)
                                        getSelectedFile(e.target.value, socket)
                                        return
                                    }
                                    if (socket) {
                                        getSelectedFile(e.target.value, socket)
                                    }
                                }
                                } className='cursor-pointer w-full text-start justify-start bg-transparent py-1 h-fit rounded-none text-sm'>{name}</Button>
                                <div className='ml-2'>
                                    {files[name].ext == 'dir' && renderFolder(name)}
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