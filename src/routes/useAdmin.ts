import { useOutletContext } from 'react-router-dom';
export function useAdmin() { return useOutletContext<{ accessKey: string; logout: () => void }>(); }
