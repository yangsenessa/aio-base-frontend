
const CommunitySection = () => {
  const handleDiscordClick = () => {
    window.open('https://discord.com/channels/1199163706983067648/1381487083176333453', '_blank');
  };

  const handleGitHubClick = () => {
    window.open('https://github.com/AIO-2030', '_blank');
  };

  return (
    <section className="bg-gradient-to-br from-primary/10 via-blue-50/80 to-purple-50/60 rounded-2xl border border-primary/20 p-8 backdrop-blur-sm shadow-xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-md">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Join the Community
          </h2>
          <p className="text-gray-700 mb-4 text-lg leading-relaxed">
            Connect with developers, share ideas, and contribute to innovative open-source projects 
            that are shaping the future of technology.
          </p>
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-l-4 border-yellow-500 p-4 mb-6 rounded-r-lg">
            <p className="text-yellow-800 font-semibold text-sm">
              🎁 <strong>Earn Airdrops!</strong> Join our Discord community and star our GitHub repository to earn exclusive airdrop rewards and early access to new features!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={handleDiscordClick}
              className="bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-3 rounded-xl hover:from-primary/90 hover:to-blue-600/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 font-semibold"
            >
              🎮 Join Discord
            </button>
            <button 
              onClick={handleGitHubClick}
              className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-semibold"
            >
              ⭐ Star on GitHub
            </button>
          </div>
        </div>
        <div className="w-full md:w-1/3 bg-gradient-to-br from-primary/20 via-blue-200/40 to-purple-200/30 h-48 rounded-2xl border border-primary/30 shadow-inner flex items-center justify-center">
          <div className="text-center text-primary/70">
            <div className="text-4xl mb-2">🚀</div>
            <p className="font-semibold">Community Hub</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
