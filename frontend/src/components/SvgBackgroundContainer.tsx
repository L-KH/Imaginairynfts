const SvgBackgroundContainer = ({ children }: any) => {
  
  return (
    <main className='dark'>
      <div className="relative flex flex-col h-[100vh] items-center justify-center dark:bg-black transition-bg">
        <div className="absolute inset-0 overflow-hidden">
          <div className="jumbo absolute -inset-[10px] opacity-50"></div>
        </div>
        {children}
      </div>
    </main>
  );
};

export default SvgBackgroundContainer;