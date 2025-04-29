"use client"

import React from "react"
import { useFeatureAccess } from "@/hooks/useFeatureAccess"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Crown } from "lucide-react"
import { PLAN_FEATURE_ENUMS } from "@/constant"

function FeatureAccessWrapper({
  children,
  feature,
  tooltipMessage = "Upgrade your plan to use this feature",
  tooltipSide = "top",
  tooltipAlign = "center",
}) {
  const featureAccess = useFeatureAccess()
  const { PICTURE_ANALYSIS, PICTURE_GENERATION, HUMANIZE, VOICE_ASSISTANCE } = PLAN_FEATURE_ENUMS

  // Check if the user has access to the requested feature
  const hasAccess = (() => {
    switch (feature) {
      case PICTURE_GENERATION:
        return featureAccess.canGeneratePictures
      case PICTURE_ANALYSIS:
        return featureAccess.canAnalyzePictures
      case HUMANIZE:
        return featureAccess.canUseHumanize
      case VOICE_ASSISTANCE:
        return featureAccess.canUseVoiceAssistance
      default:
        return false
    }
  })()

  // If the user has access, render the children normally
  if (hasAccess) {
    return children
  }

  // If the user doesn't have access, wrap in tooltip and disable
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="relative inline-block cursor-not-allowed"
          >
            {/* Clone the child element and add disabled prop */}
            {React.cloneElement(children, {
              disabled: true,
              "aria-disabled": true,
              className: `${children.props.className || ""} opacity-60`,
            })}
          </div>
        </TooltipTrigger>
        <TooltipContent side={tooltipSide} align={tooltipAlign} className="flex items-center gap-1 z-50" sideOffset={5}>
          <Crown className="h-4 w-4 text-amber-400" />
          <span>{tooltipMessage}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default FeatureAccessWrapper
