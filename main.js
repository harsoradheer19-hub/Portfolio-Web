/* ============================================
   main.js — Cursor · Slider · Reveal · Skills
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================
     1. CUSTOM CURSOR
  ========================================== */
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursor-ring');

  if (cursor && ring) {
    let ringX = 0, ringY = 0;
    let mouseX = 0, mouseY = 0;

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = mouseX + 'px';
      cursor.style.top  = mouseY + 'px';
    });

    // ring lags behind slightly
    (function animateRing() {
      ringX += (mouseX - ringX) * 0.14;
      ringY += (mouseY - ringY) * 0.14;
      ring.style.left = ringX + 'px';
      ring.style.top  = ringY + 'px';
      requestAnimationFrame(animateRing);
    })();
  }

  /* ==========================================
     2. HORIZONTAL PROJECT SLIDER
     Fixed: measure card width after full layout
     using ResizeObserver + requestAnimationFrame
  ========================================== */
  const track    = document.getElementById('sliderTrack');
  const prevBtn  = document.getElementById('prevBtn');
  const nextBtn  = document.getElementById('nextBtn');
  const dotsWrap = document.getElementById('sliderDots');
  const progFill = document.getElementById('progressFill');

  if (track) {
    const cards = Array.from(track.querySelectorAll('.project-card'));
    const TOTAL = cards.length;
    let current = 0;

    /* --- Responsive: cards visible at this breakpoint --- */
    function getCardsVisible() {
      if (window.innerWidth <= 768)  return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    /* --- Read actual rendered card width + gap from DOM --- */
    function getCardStep() {
      if (!cards[0] || !cards[1]) return 0;
      // distance between the left edges of card 0 and card 1 = width + gap
      const r0 = cards[0].getBoundingClientRect();
      const r1 = cards[1].getBoundingClientRect();
      return r1.left - r0.left;          // px step per slide
    }

    /* --- Dots --- */
    function buildDots(maxIdx) {
      dotsWrap.innerHTML = '';
      for (let i = 0; i <= maxIdx; i++) {
        const d = document.createElement('div');
        d.className = 'slider-dot' + (i === 0 ? ' active' : '');
        d.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(d);
      }
    }

    /* --- Apply slide --- */
    function update() {
      const maxIndex = Math.max(0, TOTAL - getCardsVisible());
      const step     = getCardStep();
      const offset   = current * step;

      track.style.transform = `translateX(-${offset}px)`;

      dotsWrap.querySelectorAll('.slider-dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });

      const pct = maxIndex > 0 ? (current / maxIndex) * 100 : 100;
      if (progFill) progFill.style.width = pct + '%';

      if (prevBtn) prevBtn.disabled = current === 0;
      if (nextBtn) nextBtn.disabled = current >= maxIndex;
    }

    function goTo(idx) {
      const maxIndex = Math.max(0, TOTAL - getCardsVisible());
      current = Math.max(0, Math.min(idx, maxIndex));
      update();
    }

    /* --- Buttons --- */
    if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

    /* --- Keyboard (only when projects section visible) --- */
    document.addEventListener('keydown', e => {
      const section = document.getElementById('projects');
      if (!section) return;
      const { top, bottom } = section.getBoundingClientRect();
      if (top < window.innerHeight && bottom > 0) {
        if (e.key === 'ArrowRight') goTo(current + 1);
        if (e.key === 'ArrowLeft')  goTo(current - 1);
      }
    });

    /* --- Touch swipe --- */
    let touchStartX = 0, touchStartY = 0;
    track.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    track.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        goTo(dx < 0 ? current + 1 : current - 1);
      }
    }, { passive: true });

    /* --- Mouse drag --- */
    let mouseDown = false, dragStartX = 0;
    track.addEventListener('mousedown', e => {
      mouseDown = true; dragStartX = e.clientX;
      track.style.userSelect = 'none';
    });
    document.addEventListener('mouseup', e => {
      if (!mouseDown) return;
      const dx = e.clientX - dragStartX;
      if (Math.abs(dx) > 40) goTo(dx < 0 ? current + 1 : current - 1);
      mouseDown = false;
      track.style.userSelect = '';
    });

    /* --- Resize: rebuild dots + re-clamp + re-slide --- */
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const maxIndex = Math.max(0, TOTAL - getCardsVisible());
        current = Math.min(current, maxIndex);
        buildDots(maxIndex);
        update();
      }, 80);
    });

    /* --- INIT: wait for full paint before first measurement --- */
    // Use requestAnimationFrame x2 to guarantee layout is complete
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const maxIndex = Math.max(0, TOTAL - getCardsVisible());
        buildDots(maxIndex);
        update();
      });
    });
  }

  /* ==========================================
     3. SCROLL REVEAL (IntersectionObserver)
  ========================================== */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // stagger siblings by 80ms
        const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal'));
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, idx * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ==========================================
     4. TIMELINE ITEMS REVEAL
  ========================================== */
  const timelineItems = document.querySelectorAll('.timeline-item');

  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), idx * 120);
        timelineObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  timelineItems.forEach(el => timelineObserver.observe(el));

  /* ==========================================
     5. SKILL BARS ANIMATION (Skills + Upcoming)
  ========================================== */
  const skillSection    = document.getElementById('skills');
  const upcomingSection = document.getElementById('upcoming-projects');

  function animateBarsIn(container) {
    container.querySelectorAll('.skill-fill').forEach(bar => {
      const w = bar.getAttribute('data-width');
      setTimeout(() => { bar.style.width = w + '%'; }, 250);
    });
  }

  if (skillSection) {
    new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { animateBarsIn(e.target); skillObs.unobserve(e.target); } });
    }, { threshold: 0.3 }).observe(skillSection);
  }

  // Upcoming project progress bars — trigger per card
  if (upcomingSection) {
    upcomingSection.querySelectorAll('.upcoming-card').forEach(card => {
      new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            animateBarsIn(e.target);
            e.target._obs && e.target._obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.4 }).observe(card);
    });
  }

  /* ==========================================
     6. ACTIVE NAV LINK on scroll
  ========================================== */
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-links a');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === '#' + entry.target.id
          );
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => navObserver.observe(s));

});
