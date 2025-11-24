"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface WizardStepProps {
  step: number
  title: string
  description: string
  children: React.ReactNode
  onNext: () => void
  onBack: () => void
  isLastStep: boolean
  isNextDisabled?: boolean
}

export function WizardStep({
  step,
  title,
  description,
  children,
  onNext,
  onBack,
  isLastStep,
  isNextDisabled,
}: WizardStepProps) {
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-bold ${
                    i === step
                      ? "bg-primary text-primary-foreground"
                      : i < step
                        ? "bg-success text-success"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < step ? "✓" : i}
                </div>
                {i < 3 && <div className={`w-12 h-1 ${i < step ? "bg-success" : "bg-muted"}`} />}
              </div>
            ))}
          </div>
        </div>
        <h2 className="font-display text-3xl font-bold mb-1">{title}</h2>
        <p className="text-lg text-muted-foreground">{description}</p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">{children}</CardContent>
      </Card>

      <div className="flex gap-3">
        {step > 1 && (
          <Button variant="outline" onClick={onBack} className="flex-1 bg-transparent">
            ← Back
          </Button>
        )}
        <Button onClick={onNext} disabled={isNextDisabled} className="flex-1">
          {isLastStep ? "🎉 Create List" : "Next →"}
        </Button>
      </div>
    </div>
  )
}
