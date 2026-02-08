'use client'

import * as React from 'react'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { IconSeparator } from '@/components/ui/icons'
import { useGame } from '@/lib/game/game-context'
import { Gamepad2 } from 'lucide-react'

function Navigation() {
  return (
    <nav className="flex items-center space-x-4">
      <Link
        href="/new"
        className="font-title text-2xl font-bold text-stocrates-dark hover:text-stocrates-dark-blue transition-colors"
      >
        Stocrates
      </Link>
      <IconSeparator className="size-6 text-stocrates-dark/30" />
      <Link
        href="/new"
        className="font-body text-sm font-medium text-stocrates-dark hover:text-stocrates-dark-blue transition-colors px-4 py-2 rounded-full hover:bg-stocrates-cream"
      >
        New Chat
      </Link>
    </nav>
  )
}

export function Header() {
  const { toggleGame, isGameOpen } = useGame()

  return (
    <header className="sticky top-0 z-50 w-full bg-stocrates-blue border-b-3 border-stocrates-dark">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Navigation />
        <div className="flex items-center gap-4">
          <div className="font-body text-sm text-stocrates-dark hidden md:block">
            Learn Markets Through History 🎓
          </div>
          <button
            onClick={toggleGame}
            className={cn(
              "relative overflow-hidden px-4 py-2 rounded-full font-title text-sm font-bold uppercase tracking-wide transition-all duration-300",
              "flex items-center gap-2",
              isGameOpen
                ? "bg-stocrates-dark text-stocrates-cream"
                : "bg-gradient-to-r from-stocrates-dark via-stocrates-dark-blue to-stocrates-dark text-stocrates-cream hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 animate-gradient"
            )}
          >
            <Gamepad2 className="h-4 w-4" />
            <span className="hidden sm:inline">Investment Game</span>
            <span className="sm:hidden">Game</span>
          </button>
        </div>
      </div>
    </header>
  )
}
