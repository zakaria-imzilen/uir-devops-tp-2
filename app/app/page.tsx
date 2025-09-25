import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Sparkles, Zap, Palette, Layers, ArrowRight, Star } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      <div className="relative z-10 flex min-h-screen w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-4xl text-center">
          <div className="flex flex-col gap-8">
            {/* Badge */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm text-white/90">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>Visual Web Builder Platform</span>
              </div>
            </div>
            
            {/* Main heading with gradient text */}
            <div>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6">
                <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                  FlowCraft
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-white bg-clip-text text-transparent">
                  Studio
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                Transform your ideas into stunning web experiences with our 
                <span className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text font-semibold"> revolutionary visual editor</span>. 
                No code required, infinite possibilities.
              </p>
            </div>
            
            {/* Feature highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto my-8">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <p className="text-white/90 text-sm font-medium">Lightning Fast</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                <Palette className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-white/90 text-sm font-medium">Drag & Drop</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                <Layers className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-white/90 text-sm font-medium">Pro Templates</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                <Sparkles className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                <p className="text-white/90 text-sm font-medium">AI Powered</p>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
              <Button 
                asChild 
                size="lg" 
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 text-white font-semibold px-8 py-6 text-lg shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105"
              >
                <Link href="/auth/login" className="inline-flex items-center gap-2">
                  Start Building
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="w-full sm:w-auto bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 font-semibold px-8 py-6 text-lg transition-all duration-300 hover:scale-105"
              >
                <Link href="/auth/sign-up">
                  Create Account
                </Link>
              </Button>
            </div>
            
            {/* Social proof */}
            <div className="mt-12 text-white/60 text-sm">
              <p>Trusted by 50,000+ creators worldwide</p>
              <div className="flex justify-center items-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-2 text-white/80">4.9/5 from 2,847 reviews</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating elements */}
      <div className="absolute top-20 right-20 w-4 h-4 bg-white/20 rounded-full animate-bounce delay-300"></div>
      <div className="absolute bottom-32 left-20 w-3 h-3 bg-purple-400/40 rounded-full animate-bounce delay-700"></div>
      <div className="absolute top-1/3 left-10 w-2 h-2 bg-blue-400/40 rounded-full animate-bounce delay-1000"></div>
    </div>
  )
}