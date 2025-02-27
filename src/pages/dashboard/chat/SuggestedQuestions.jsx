import React from "react" 
import { Button } from "@/components/ui/button"

const SuggestedQuestions = React.memo(({ questions, partialMessage, onQuestionClick }) => {
  if (questions.length === 0 || partialMessage) return null

  return (
    <div className="flex flex-col items-start mt-4 space-y-2">
      {questions.map((question, index) => (
        <Button key={index} variant="outline" size="sm" onClick={() => onQuestionClick(question)} className="text-sm">
          {question}
        </Button>
      ))}
    </div>
  )
})

export default SuggestedQuestions