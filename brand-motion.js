// The existing 90° author signature: turn, hold, return. Replay on tap or keyboard activation.
(()=>{
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 for(const trigger of document.querySelectorAll('[data-animated-logo]')){
  const mark=trigger.querySelector('[data-logo-mark]');if(!mark)continue;
  const stop=()=>mark.classList.remove('signature-turn');
  const play=()=>{if(reduced.matches||mark.classList.contains('signature-turn'))return;mark.classList.add('signature-turn');};
  trigger.addEventListener('click',play);
  mark.addEventListener('animationend',stop);
  mark.addEventListener('animationcancel',stop);
  reduced.addEventListener?.('change',()=>{if(reduced.matches)stop();});
  if(mark.complete)play();else mark.addEventListener('load',play,{once:true});
 }
})();
