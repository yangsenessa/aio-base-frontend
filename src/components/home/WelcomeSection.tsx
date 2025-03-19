
const WelcomeSection = () => {
  return (
    <section className="max-w-3xl mx-auto text-center space-y-6 mb-16 pt-12">
      <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        Welcome to AIO-center
      </div>
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
        Open Source and AI Development Projects
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        A curated hub for innovative projects across AI, open source, and language models, 
        bringing together cutting-edge technology and collaborative development.
      </p>
    </section>
  );
};

export default WelcomeSection;
