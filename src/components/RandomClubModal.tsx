import { useEffect, useRef, useState } from 'react';
import DirectoryCard from './DirectoryCard';
import type { DirectoryItem } from '../routes/Clubs';

export default function RandomClubModal({ clubs, close }: { clubs: DirectoryItem[]; close: () => void }) {
 const [index, setIndex] = useState(() => Math.floor(Math.random() * clubs.length));
 const dialog = useRef<HTMLDialogElement>(null);
 const club = clubs[index];
 useEffect(() => {
  const element = dialog.current!;
  element.showModal();
  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  return () => { element.close(); document.body.style.overflow = previousOverflow; };
 }, []);
 const again = () => {
  if (clubs.length < 2) return;
  // Choose uniformly from every club except the current one.
  setIndex(current => {
   const next = Math.floor(Math.random() * (clubs.length - 1));
   return next >= current ? next + 1 : next;
  });
 };
 return <dialog ref={dialog} aria-labelledby="random-club-heading" onCancel={close} className="rounded p-4 w-full max-w-xl max-h-[90vh] overflow-auto backdrop:bg-black/50">
  <div className="flex justify-between items-center gap-4 px-4 pt-2"><h2 id="random-club-heading" className="text-2xl">Your lucky find</h2><button type="button" onClick={close} aria-label="Close random club">Close</button></div>
  <p className="text-sm px-4 mt-2">A random pick from the full directory.</p>
  <div aria-live="polite" aria-atomic="true">
   <DirectoryCard {...club} />
   <dl className="px-4 pb-4 text-sm flex flex-col gap-2">
    {club.category && <div><dt className="font-medium">Category</dt><dd className="capitalize">{club.category === 'food' ? 'Food & Drink' : club.category}</dd></div>}
    {club.location && <div><dt className="font-medium">Where</dt><dd>{club.location}</dd></div>}
    {club.schedule && <div><dt className="font-medium">When</dt><dd>{club.schedule}</dd></div>}
   </dl>
  </div>
  <div className="px-4 pb-2"><button type="button" className="primaryBtn" disabled={clubs.length < 2} onClick={again}>Do it again</button>{clubs.length < 2 && <p className="text-sm mt-2">This is the only club available right now.</p>}</div>
 </dialog>;
}
