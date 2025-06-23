// CUSTOM CURSOR
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
  cursor.style.top  = e.clientY + 'px';
  cursor.style.left = e.clientX + 'px';
});

// GSAP Animations
gsap.registerPlugin(ScrollTrigger);

// Timeline reveal
gsap.utils.toArray('.event').forEach(el => {
  gsap.fromTo(el,
    { opacity: 0, y: 50 },
    {
      opacity: 1, y: 0, duration: 0.8,
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    }
  );
});

// Projects fade-in
gsap.from('.card', {
  opacity: 0, y: 30, duration: 0.6, stagger: 0.2,
  scrollTrigger: { trigger: '.projects', start: 'top 80%' }
});

// Vision kinetic text
gsap.to('.kinetic', {
  opacity: 1, scale: 1, duration: 1.2,
  ease: 'elastic.out(1, 0.5)',
  scrollTrigger: { trigger: '.vision', start: 'top 80%' }
});

// Smooth nav scroll offset
document.querySelectorAll('.navbar a').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const tgt = document.querySelector(a.getAttribute('href'));
    window.scrollTo({ top: tgt.offsetTop - 60, behavior: 'smooth' });
  });
});
