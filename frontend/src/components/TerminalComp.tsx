import { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css'
import { Socket } from 'socket.io-client';

export default function TerminalComponent({ newSocket, replData }: {newSocket: Socket | any, replData: string[]}) {
    let command = ''
    const terminalRef: any = useRef()
    const OPTIONS_TERM = {
        useStyle: true,
        screenKeys: true,
        cursorBlink: true,
        cols: 200,
        theme: {
            background: "black"
        }
    };
    useEffect(() => {
        if (!terminalRef.current || !newSocket || !terminalRef || terminalRef.current.childNodes.length > 0) {
            return
        }
        console.log(newSocket, replData)
        newSocket.emit("requestTerminal", replData[0]);
        newSocket.on("terminal", terminalHandler)
        const fitAddon = new FitAddon();
        const term = new Terminal(OPTIONS_TERM);
        term.loadAddon(fitAddon);
        term.open(terminalRef.current);
        fitAddon.fit();
        function terminalHandler({ data }: any) {
            console.log(data)
        }
        newSocket.on('terminal-response', (data: any) => {
            term.write(data)
        })
        term.onData(key => {
            term.write(key);
            if (key == '\r') {
                console.log(command)
                newSocket?.emit('terminal-exec', `${command}\r`, replData)
                term.write('\n')
                term.clear()
                command = ''
                return
            }
            command += key
            console.log(key)
            return () => {
                newSocket.off("terminal")
            }
        })
    }, [terminalRef, newSocket])
    return (
        <div className='w-5/12 mx-2 bg-[#1e1e1e] px-4 py-2'>
            <p className='text-sm'>&gt;&#95; Console</p>
            <div style={{ width: 'fit', height: 'full', color: 'white' }} ref={terminalRef}></div>
        </div>
    )
}
