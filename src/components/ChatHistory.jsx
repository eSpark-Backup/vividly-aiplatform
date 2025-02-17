import React from 'react'
import { Input } from './ui/input'
import { Search } from 'lucide-react'

const ChatHistory = () => {
    return (
        <div>
            <Input
                variant="basic"
                icon={Search}
                iconClassName="h-[17px] w-[17px]"
                placeholder="Search"
                className="w-full"
            />
        </div>
    )
}

export default ChatHistory