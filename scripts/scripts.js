/* --------------------------- assets/scripts.js --------------------------- */
/* Save as: assets/scripts.js */
(function(){
// Header shrink on scroll
const header = document.querySelector('.header');
window.addEventListener('scroll', ()=>{
if(window.scrollY > 40) header.classList.add('scrolled');
else header.classList.remove('scrolled');
});


// Intersection reveal
const io = new IntersectionObserver(entries=>{
entries.forEach(e=>{
if(e.isIntersecting) e.target.classList.add('show');
});
},{threshold:0.15});
document.querySelectorAll('.fade-in').forEach(el=>io.observe(el));


// Smooth navigation for same-site links
document.querySelectorAll('a[href^="#"]').forEach(a=>{
a.addEventListener('click', e=>{
e.preventDefault();
const id = a.getAttribute('href').slice(1);
const el = document.getElementById(id);
if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
});
});
})();