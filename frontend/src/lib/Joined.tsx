import React, { createContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

export interface JoinedStatusContextType {
  joinedStatus: boolean;
  setJoinedStatus: Dispatch<SetStateAction<boolean>>;
}

export const JoinedStatus = createContext<JoinedStatusContextType | null>(null);

const Joined = ({ children }: { children: ReactNode }) => {
  const [joinedStatus, setJoinedStatus] = useState(false);

  return (
    <JoinedStatus.Provider value={{ setJoinedStatus, joinedStatus }}>
      {children}
    </JoinedStatus.Provider>
  );
};

export default Joined;
