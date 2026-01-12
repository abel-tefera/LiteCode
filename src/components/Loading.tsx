import PacmanLoader from 'react-spinners/PacmanLoader';

const Loading = () => {
  return (
    <div className="flex h-screen w-full items-center">
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex h-full items-center">
          {/* <PacmanLoader
            color={'#50FF6C'}
            size={120}
          /> */}
          <p className="text-white">Initializing App...</p>
        </div>
      </div>
    </div>
  );
};

export default Loading;
