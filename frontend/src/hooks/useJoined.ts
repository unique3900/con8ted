import { useContext } from "react";
import { JoinedStatus, JoinedStatusContextType } from "../lib/Joined";

export const useJoined = (): JoinedStatusContextType => {
    const context = useContext(JoinedStatus);
    if (!context) {
      throw new Error('useJoined must be used within a Joined provider');
    }
    return context;
  };