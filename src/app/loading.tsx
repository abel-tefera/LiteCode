'use-client';

// Importing loader
import PacmanLoader from 'react-spinners/PacmanLoader';

export default function Loading() {

  return (
    <div className="flex h-screen w-full items-center">
      <div className="flex h-full w-full items-center justify-start pl-96">
        <div className="flex h-full items-center">
          <PacmanLoader
            color={'#50FF6C'}
            size={120}
          />
        </div>
      </div>
    </div>
  );
}
