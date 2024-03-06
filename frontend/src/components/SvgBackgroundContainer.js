

const SvgBackgroundContainer = ({ children }) => {
  
  return (
    <main className='dark'>
      <div class="relative flex flex-col h-[100vh] items-center justify-center bg-white dark:bg-black transition-bg">
        <div class="absolute inset-0 overflow-hidden">
          <div class="jumbo absolute -inset-[10px] opacity-50"></div>
        </div>
        {children}
      </div>
    </main>
  );
};

export default SvgBackgroundContainer;
