import { Loader } from 'lucide-react'
import React from 'react'

const ComponentLoader = ({description}) => {
  return (
<div className="container mx-auto py-10 px-4 max-w-5xl flex flex-col items-center justify-center min-h-[50vh]">
        <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{description || "Loading..."}</p>
      </div>
  )
}

export default ComponentLoader