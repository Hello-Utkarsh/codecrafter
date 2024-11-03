import { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css'
import { Socket } from 'socket.io-client';
import { useUser } from '@clerk/clerk-react';

export default function TerminalComponent({ newSocket, replData, user }: { newSocket: Socket | any, replData: string[], user: any }) {
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
        if (!terminalRef.current || !user.user?.id || !newSocket || !terminalRef || terminalRef.current.childNodes.length > 0) {
            return
        }
        newSocket.emit("requestTerminal", replData[0], user.user?.id);
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
        term.onKey((key, ev): any => {
            term.write(key.key);
            if (key.domEvent.key == 'Backspace') {
                newSocket?.emit('terminal-exec', `${command}\r`, replData, user.user?.id)
                term.write('\b \b')
                command = ''
                command += command.slice(0, command.length - 2)
                return
            }
            if (key.key == '\r') {
                newSocket?.emit('terminal-exec', `${command}\r`, replData, user.user?.id)
                console.log(command)
                term.write('\n')
                command = ''
                return
            }
            command += key.key
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
