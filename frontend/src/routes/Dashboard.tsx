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


export default function Dashboard() {
  const [open, setOpen] = useState(false)
  const [replType, setReplType] = useState("")
  const [replName, setReplName] = useState('')
  const [socket, setSocket] = useState<Socket>()
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate();
  
  useEffect(() => {
    const newSocket: any = io('http://localhost:3000')
    setSocket(newSocket)
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

  const Submit = () => {
    socket?.emit('create-repl', [replName, replType])
    socket?.on('dir-exist', (is_created) => {
      if (is_created == 'EEXIST') {
        toast("looks like a repl with this name already exist")
        return
      } else{
        console.log("some problem occured")
      }
    })
    socket?.on('success-repl-creation', () => {
      console.log(replName, replType)
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
                        : "Create Repl"}
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
                <Button onClick={() => Submit()} className='border border-white bg-black' style={{marginTop: '8px'}}>Create</Button>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
        <div className='w-full mt-8 border-2 border-gray-300 px-5 rounded-md divide-y-2 divide-gray-300'>
          <div className='flex justify-between mx-auto items-center py-6'>
            <p>Name</p>
            <p className='max-w-[50%] truncate ...'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam eius recusandae nam sunt facilis officia veritatis sequi possimus hic rem.</p>
            <img className='h-4 cursor-pointer' src="/delete.png" alt="" />
          </div>
          <div className='flex justify-between mx-auto items-center py-6'>
            <p>Name</p>
            <p>Description</p>
            <img className='h-4 cursor-pointer' src="/delete.png" alt="" />
          </div>
          <div className='flex justify-between mx-auto items-center py-6'>
            <p>Name</p>
            <p>Description</p>
            <img className='h-4 cursor-pointer' src="/delete.png" alt="" />
          </div>
          <Toaster className='bg-black text-white'/>
        </div>
      </div>
    </div>
  )
}
