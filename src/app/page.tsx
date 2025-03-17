'use client'

import { Game } from '@/components/Game'
import { EggLogo } from '@/components/EggLogo'
import { Suspense, Component } from 'react'
import Head from 'next/head'

class ErrorBoundary extends Component<{ children: React.ReactNode, FallbackComponent: React.ComponentType<{ error: Error }> }> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <this.props.FallbackComponent error={this.state.error!} />;
    }
    return this.props.children;
  }
}

const LoadingFallback = () => (
  <div className="animate-pulse w-full h-full bg-gray-200 rounded-lg" />
)

const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="text-red-500 p-4">
    <h2>Something went wrong:</h2>
    <p>{error.message}</p>
  </div>
)

export default function Home() {
  return (
    <>
      <Head>
        <title>Flappy Ostrich - Fun Browser Game</title>
        <meta name="description" content="Play Flappy Ostrich, a fun browser-based game!" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-sky-300">
        <EggLogo />
        <h1 className="text-3xl md:text-4xl font-bold mb-4 md:mb-8 text-white">
          Flappy Ostrich
        </h1>
        <div className="relative w-[800px] h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense fallback={<LoadingFallback />}>
              <Game />
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
    </>
  )
}