import AppBar from '@/components/AppBar'
import { Button } from '@/components/ui/button'
import { Toaster } from "@/components/ui/sonner"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { redirect, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { Socket } from 'node_modules/socket.io-client/build/cjs'
import { useUser } from '@clerk/clerk-react'


export default function Dashboard() {
  const [open, setOpen] = useState(false)
  const [replType, setReplType] = useState("")
  const [replName, setReplName] = useState('')
  const [socket, setSocket] = useState<Socket>()
  const [error, setError] = useState<string | null>(null)
  const [userRepl, setUserRepls] = useState<{ file: string, fileType: string, docType: string }[]>()
  const navigate = useNavigate();
  const user = useUser()

  useEffect(() => {
    if (user.user?.id) {
      const newSocket: any = io('http://localhost:3000')
      setSocket(newSocket)
      newSocket.emit('createUserDir', user.user?.id)
      newSocket.on('createUserDirErr', (createDir: any, userDir: any) => {
        console.log(userDir)
        setUserRepls(userDir)
        if (createDir == 'EEXIST') {
          return
        } else {
          toast("some problem occured")
        }
      })
    }
  }, [])

  const frameworks = [
    {
      value: "node",
      label: "Node js",
    },
    {
      value: "python",
      label: "Python",
    },
  ]

  const deleteRepl = async (name: string) => {
    socket?.emit('delete-repl', user.user?.id, name, (res: any, err: any) => {
      console.log(res, err)
      if (res == 'success') {
        const dummyRepl = userRepl
        dummyRepl?.filter((x) => x.file != name)
        setUserRepls(dummyRepl)
        toast('Successfully Deleted')
      } else {
        toast(err)
      }
    })
  }

  const Submit = () => {
    socket?.emit('create-repl', [replName, replType, user.user?.id])
    socket?.on('dir-exist', (is_created) => {
      console.log("perfect")
      if (is_created == 'EEXIST') {
        toast("looks like a repl with this name already exist")
        return
      } else {
        console.log("some problem occured")
      }
    })
    socket?.on('success-repl-creation', () => {
      return navigate(`/repl/${replName}/${replType}`)
    })
  }

  return (
    <div>
      <AppBar />
      <div className='px-16 py-6'>
        <div className='flex justify-between mt-4'>
          <h2 className='text-2xl font-medium tracking-wide'>Your Repls</h2>
          <Dialog>
            <DialogTrigger className='flex bg-gray-100 px-2 py-1 rounded-md text-black font-medium hover:bg-gray-300'>Create Repl</DialogTrigger>
            <DialogContent className='bg-black'>
              <DialogTitle className='text-center'>Create Repl</DialogTitle>
              <DialogHeader>
                <div className='mb-2 flex flex-col'>
                  <label htmlFor="" className='mb-1'>Name</label>
                  <input onChange={(e) => setReplName(e.target.value)} type="text" placeholder='Python Practice' className='py-2 px-2 rounded-sm' />
                </div>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger className='bg-black' asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-[150px] justify-between"
                    >
                      {replType
                        ? frameworks.find((framework) => framework.value === replType)?.label
                        : "Repl Type"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command className='bg-black'>
                      <CommandInput className='text-white' placeholder="Search framework..." />
                      <CommandList>
                        <CommandEmpty className='text-white text-center py-2'>No framework found.</CommandEmpty>
                        <CommandGroup>
                          {frameworks.map((framework) => (
                            <CommandItem
                              className='text-white'
                              key={framework.value}
                              value={framework.value}
                              onSelect={(currentValue) => {
                                setReplType(currentValue === replType ? "" : currentValue)
                                setOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  replType === framework.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {framework.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Button onClick={() => Submit()} className='border border-white bg-black' style={{ marginTop: '8px' }}>Create</Button>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
        <div className='w-full mt-8 rounded-md grid grid-cols-8'>
          {(userRepl && userRepl.length > 0) ? userRepl.map((x) => {
            const icon = x.docType == 'node' ? '/jsicon.svg' : 'pythonicon.png'
            return (
              <div className='flex flex-col justify-between items-center py-3 px-3 w-32 border-2 border-gray-300 rounded-md cursor-pointer' onClick={() => navigate(`/repl/${x.file}/${x.docType}`)}>
                <img src={icon} className='h-10 my-1' alt="" />
                <div className='flex'>
                  <p className='mr-3'>{x.file}</p>
                  <p className='cursor-pointer' onClick={(e) => {
                    e.stopPropagation()
                    deleteRepl(x.file)
                  }}>x</p>
                </div>
              </div>
            )
          }) : <p className='text-center my-2'>You have no repls</p>}
          <Toaster className='bg-black text-white' />
        </div>
      </div>
    </div>
  )
}
