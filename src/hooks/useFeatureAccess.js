import { PLAN_FEATURE_ENUMS } from "@/constant";
import { useWebSocketContext } from "@/services/WebSocketProvider";
import { useUserSubscriptionStore } from "@/store/useUserSubscriptionStore";
import { useMemo } from "react"

export function useFeatureAccess() {
    const VIVIDLY_FEATURE_LIMITS = {
        FREE: {
            name: "FREE",
            maxPictureGeneration: 20,
            maxPictureAnalysis: 20,
            humanizeSupport: false,
            voiceAssistanceSupport: false,
        },
        [import.meta.env.VITE_VIVIDLY_PLUS_PLAN_MONTHLY_ID]: {
            name: "VIVIDLY PLUS MONTHLY",
            maxPictureGeneration: 100,
            maxPictureAnalysis: 100,
            humanizeSupport: false,
            voiceAssistanceSupport: false,
        },
        [import.meta.env.VITE_VIVIDLY_PLUS_PLAN_ANNUALLY_ID]: {
            ame: "VIVIDLY PLUS ANNUAL",
            maxPictureGeneration: 100,
            maxPictureAnalysis: 100,
            humanizeSupport: false,
            voiceAssistanceSupport: false,
        },
        [import.meta.env.VITE_VIVIDLY_PREMIUM_PLAN_MONTHLY_ID]: {
            name: "VIVIDLY PREMIUM MONTHLY",
            maxPictureGeneration: Infinity,
            maxPictureAnalysis: Infinity,
            humanizeSupport: true,
            voiceAssistanceSupport: true,
        },
        [import.meta.env.VITE_VIVIDLY_PREMIUM_PLAN_ANNUALLY_ID]: {
            name: "VIVIDLY PREMIUM ANNUAL",
            maxPictureGeneration: Infinity,
            maxPictureAnalysis: Infinity,
            humanizeSupport: true,
            voiceAssistanceSupport: true,
        },
        [import.meta.env.VITE_VIVIDLY_STUDENT_PLAN_MONTHLY_ID]: {
            name: "VIVIDLY STUDENT MONTHLY",
            maxPictureGeneration: Infinity,
            maxPictureAnalysis: Infinity,
            humanizeSupport: true,
            voiceAssistanceSupport: true,
        },
        [import.meta.env.VITE_VIVIDLY_STUDENT_PLAN_ANNUALLY_ID]: {
            name: "VIVIDLY STUDENT ANNUAL",
            maxPictureGeneration: Infinity,
            maxPictureAnalysis: Infinity,
            humanizeSupport: true,
            voiceAssistanceSupport: true,
        },
    };

    const { planId } = useUserSubscriptionStore()
    const { userImageGenerationCount, userImageAnalysisCount } = useWebSocketContext();

    const limits = useMemo(() => {
        const planLimits = planId ? VIVIDLY_FEATURE_LIMITS[planId] : VIVIDLY_FEATURE_LIMITS.FREE

        return planLimits || VIVIDLY_FEATURE_LIMITS.FREE
    }, [planId])

    const { PICTURE_GENERATION, PICTURE_ANALYSIS, HUMANIZE, VOICE_ASSISTANCE } = PLAN_FEATURE_ENUMS

    const canAccessFeature = (feature) => {
        switch (feature) {
            case PICTURE_GENERATION:
                return userImageGenerationCount < limits.maxPictureGeneration
            case PICTURE_ANALYSIS:
                return userImageAnalysisCount < limits.maxPictureAnalysis
            case HUMANIZE:
                return limits.humanizeSupport
            case VOICE_ASSISTANCE:
                return limits.voiceAssistanceSupport
            default:
                return false
        }
    }

    const getRemainingUsage = (feature) => {
        const max = feature === PICTURE_GENERATION ? limits.maxPictureGeneration : limits.maxPictureAnalysis

        const current = feature === PICTURE_GENERATION ? userImageGenerationCount : userImageAnalysisCount

        if (max === Number.POSITIVE_INFINITY) return "unlimited"
        return Math.max(0, max - current)
    }

    return {
        canGeneratePictures: canAccessFeature(PICTURE_GENERATION),
        canAnalyzePictures: canAccessFeature(PICTURE_ANALYSIS),
        canUseHumanize: canAccessFeature(HUMANIZE),
        canUseVoiceAssistance: canAccessFeature(VOICE_ASSISTANCE),
        remainingPictureGenerations: getRemainingUsage(PICTURE_GENERATION),
        remainingPictureAnalyses: getRemainingUsage(PICTURE_ANALYSIS),
        currentPlan: limits,
        isPremiumPlan: limits.name.includes("PREMIUM") || limits.name.includes("STUDENT"),
        isPlusPlan: limits.name.includes("PLUS"),
        isFreePlan: limits.name === "FREE",
    }
}

