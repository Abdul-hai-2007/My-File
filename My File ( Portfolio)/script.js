// =====================================================
// Reveal on scroll
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  const revealEls = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach((el) => io.observe(el));

  // Mobile nav toggle
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("open");
      toggle.textContent = nav.classList.contains("open") ? "✕" : "☰";
    });
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.textContent = "☰";
      })
    );
  }

  // Contact form -> mailto handoff
  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const service = form.service.value;
      const message = form.message.value.trim();
      const status = document.getElementById("form-status");

      if (!name || !email || !message) {
        status.textContent = "Please fill in your name, email, and message.";
        return;
      }

      const subject = encodeURIComponent(`New enquiry from ${name} — ${service || "General"}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nInterested in: ${service || "Not specified"}\n\nMessage:\n${message}`
      );
      window.location.href = `mailto:mehmood.webexoerts@gmail.com?subject=${subject}&body=${body}`;
      status.textContent = "Opening your email app — just hit send once it loads.";
      form.reset();
    });
  }
});

// =====================================================
// Constellation canvas — hero signature animation
// Nodes drift slowly, nearest links glow, one "north star"
// node sits brighter than the rest.
// =====================================================
(function () {
  const canvas = document.getElementById("constellation");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let w, h, nodes, dpr;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeNodes() {
    const count = Math.max(18, Math.floor((w * h) / 42000));
    nodes = new Array(count).fill(0).map((_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: i === 0 ? 3.2 : Math.random() * 1.6 + 0.8,
      star: i === 0,
    }));
  }

  function step() {
    ctx.clearRect(0, 0, w, h);

    nodes.forEach((n) => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -20) n.x = w + 20;
      if (n.x > w + 20) n.x = -20;
      if (n.y < -20) n.y = h + 20;
      if (n.y > h + 20) n.y = -20;
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const max = 150;
        if (dist < max) {
          ctx.strokeStyle = `rgba(227, 178, 60, ${(1 - dist / max) * 0.16})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    nodes.forEach((n) => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.star ? "rgba(227, 178, 60, 0.95)" : "rgba(237, 234, 225, 0.55)";
      ctx.fill();
      if (n.star) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(227, 178, 60, 0.12)";
        ctx.fill();
      }
    });

    if (!reduceMotion) requestAnimationFrame(step);
  }

  resize();
  makeNodes();
  step();

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      makeNodes();
      if (reduceMotion) step();
    }, 200);
  });
})();
