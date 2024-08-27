import { useLoaderData } from 'react-router-dom'

export default function Repl() {
    const replID = useLoaderData()
    console.log(replID)
  return (
    <div>
      repl
    </div>
  )
}

export async function loader({params}: any){
    return await params.replID
}