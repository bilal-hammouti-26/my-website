// Intro animation
window.addEventListener('load',()=>{
  setTimeout(()=>{ document.getElementById('intro').style.transform='translateY(-100%)'; },1200);
});

// Menu mobile
const toggle = document.querySelector('.menu-toggle');
const navbar = document.querySelector('.navbar');
toggle.addEventListener('click',()=>{ navbar.classList.toggle('active'); });

// Scroll header
window.addEventListener('scroll',()=>{
  const header=document.querySelector('.header');
  if(window.scrollY>50) header.style.background='rgba(10,25,49,0.98)';
  else header.style.background='rgba(10,25,49,0.95)';
});





