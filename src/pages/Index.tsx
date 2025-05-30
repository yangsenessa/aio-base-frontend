
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1f2e] via-[#16213e] to-[#0f172a] text-white flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh] bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      </div>

      <div className="text-center max-w-4xl space-y-8 relative z-10">
        <div className="flex flex-col items-center mb-12">
          <div className="relative mb-8 group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500" />
            <img 
              src="/lovable-uploads/2d34a83d-9197-4265-b617-d94a713ecb24.png" 
              alt="AIO Logo" 
              className="w-80 h-80 relative z-10 drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight bg-gradient-to-r from-white via-blue-100 to-emerald-100 bg-clip-text text-transparent">
            When stars fall in chaos,<br />
            the colony brings order.
          </h1>
        </div>

        <p className="text-2xl md:text-3xl font-medium text-gray-200/90 leading-relaxed">
          A thousand minds, one nest. A million paths, one frequency.
        </p>

        <div className="mt-16 flex justify-center">
          <Link to="/home">
            <button className="group relative px-10 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold text-lg rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/25 hover:-translate-y-1">
              <span className="relative z-10">Join the Colony</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </Link>
        </div>

        <div className="mt-16 text-lg text-gray-300/80 tracking-wide font-medium">
          AIO — Agent Input & Output Protocol
        </div>
      </div>

      {/* Enhanced animated background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[200vw] h-[200vh] opacity-30">
          <div className="absolute inset-0 bg-gradient-radial from-blue-500/10 via-transparent to-transparent animate-glow-pulse" />
        </div>
      </div>
    </div>
  );
};

export default Index;
