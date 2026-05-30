/* ==========================================================================
   INTERACTIVIDAD DE LA PÁGINA - ELMER MERCADO
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================
     1. EFECTO DE SCROLL EN ENCABEZADO
     ========================================== */
  const header = document.getElementById('main-header');
  
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll);
  // Ejecutar una vez al inicio por si la página ya está desplazada
  handleScroll();


  /* ==========================================
     2. MENÚ MÓVIL DESPLEGABLE
     ========================================== */
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu-dropdown');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-nav-btn');

  const toggleMenu = () => {
    menuToggle.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    // Impedir el scroll de la página de fondo cuando el menú está abierto
    if (mobileMenu.classList.contains('open')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  menuToggle.addEventListener('click', toggleMenu);

  // Cerrar menú al hacer clic en cualquier enlace
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });


  /* ==========================================
     3. CAROUSEL DE TESTIMONIOS
     ========================================== */
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots = document.querySelectorAll('.slider-dots .dot');
  const btnPrev = document.getElementById('testimonial-prev');
  const btnNext = document.getElementById('testimonial-next');
  
  let currentSlide = 0;
  let autoPlayTimer = null;
  const autoPlayDelay = 8000; // 8 segundos

  const showSlide = (index) => {
    // Eliminar clases activas actuales
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Activar slide y dot seleccionado
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    currentSlide = index;
  };

  const nextSlide = () => {
    let next = currentSlide + 1;
    if (next >= slides.length) next = 0;
    showSlide(next);
  };

  const prevSlide = () => {
    let prev = currentSlide - 1;
    if (prev < 0) prev = slides.length - 1;
    showSlide(prev);
  };

  // Event Listeners para controles
  if (btnNext && btnPrev) {
    btnNext.addEventListener('click', () => {
      nextSlide();
      resetAutoPlay();
    });

    btnPrev.addEventListener('click', () => {
      prevSlide();
      resetAutoPlay();
    });
  }

  // Event Listeners para los puntos indicadores (Dots)
  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      const index = parseInt(e.target.getAttribute('data-index'));
      showSlide(index);
      resetAutoPlay();
    });
  });

  // Funciones de AutoPlay
  const startAutoPlay = () => {
    autoPlayTimer = setInterval(nextSlide, autoPlayDelay);
  };

  const resetAutoPlay = () => {
    clearInterval(autoPlayTimer);
    startAutoPlay();
  };

  // Inicializar slider si existe
  if (slides.length > 0) {
    startAutoPlay();
  }


  /* ==========================================
     4. ENVÍO DE FORMULARIO DE RESERVAS (AJAX)
     ========================================== */
  const bookingForm = document.getElementById('booking-form');
  const statusBox = document.getElementById('form-status-message');
  const statusText = document.getElementById('status-text');
  const submitBtn = document.getElementById('form-submit-btn');

  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Mostrar estado de cargando
      statusBox.className = 'form-status-box loading';
      statusBox.querySelector('.status-icon').className = 'fa-solid fa-spinner status-icon';
      statusText.textContent = 'Procesando tu solicitud y preparando tu mensaje de WhatsApp...';
      submitBtn.disabled = true;

      // Obtener datos del formulario
      const formData = new FormData(bookingForm);
      const data = Object.fromEntries(formData.entries());

      // Traducir tipo de evento para el mensaje
      const eventLabelMap = {
        'boda': 'Boda de Ensueño 💍',
        'corporativo': 'Gala Corporativa 💼',
        'social': 'Graduación / Quinceañero 🎉',
        'protocolo': 'Acto Oficial / Protocolar 🎙️',
        'otro': 'Otro Tipo de Evento ✨'
      };
      const selectedEvent = eventLabelMap[data.eventType] || 'No especificado';

      // Construir mensaje estructurado para WhatsApp
      const whatsappText = `¡Hola Elmer! Quisiera solicitar una consulta de reserva para mi evento.

📌 *Mis Datos de Contacto:*
- *Nombre:* ${data.name}
- *Correo:* ${data.email}
- *Teléfono:* ${data.phone || 'No especificado'}

📅 *Detalles del Evento:*
- *Fecha:* ${data.date || 'Por definir'}
- *Tipo de Evento:* ${selectedEvent}

💬 *Mensaje / Consulta:*
${data.message}`;

      const encodedText = encodeURIComponent(whatsappText);
      const whatsappUrl = `https://wa.me/51976966667?text=${encodedText}`;

      try {
        // Registrar en paralelo la solicitud en el servidor Node.js
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // Éxito en el backend
          statusBox.className = 'form-status-box success';
          statusBox.querySelector('.status-icon').className = 'fa-solid fa-circle-check status-icon';
          statusText.textContent = '¡Excelente! Se ha abierto una pestaña nueva de WhatsApp para que me envíes tu mensaje formateado directamente. También he registrado tu solicitud en el sistema.';
          
          // Abrir WhatsApp en pestaña nueva
          window.open(whatsappUrl, '_blank');
          
          // Limpiar formulario
          bookingForm.reset();
        } else {
          // El servidor respondió con error pero igual permitimos ir a WhatsApp
          statusBox.className = 'form-status-box success';
          statusBox.querySelector('.status-icon').className = 'fa-solid fa-circle-check status-icon';
          statusText.textContent = 'Abriendo tu chat de WhatsApp directamente...';
          
          window.open(whatsappUrl, '_blank');
        }
      } catch (error) {
        // Error de red con el servidor, pero procedemos de igual manera con WhatsApp (es el canal principal)
        console.warn('Servidor offline o error de red. Redirigiendo de todos modos a WhatsApp:', error);
        statusBox.className = 'form-status-box success';
        statusBox.querySelector('.status-icon').className = 'fa-solid fa-circle-check status-icon';
        statusText.textContent = 'Conexión con el servidor omitida. Abriendo tu chat de WhatsApp directo para completar tu reserva...';
        
        window.open(whatsappUrl, '_blank');
      } finally {
        // Habilitar el botón nuevamente
        submitBtn.disabled = false;
        
        // Hacer scroll suave hacia el mensaje de estado si no está visible
        statusBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }


  /* ==========================================
     5. ANIMACIONES AL HACER SCROLL (INTERSECTION OBSERVER)
     ========================================== */
  // Agregar una clase de estilo de animación a los elementos que queremos animar
  const animatedElements = document.querySelectorAll(
    '.about-image-wrapper, .about-text-content, .service-card, .gallery-item, .contact-info-column, .contact-form-column'
  );

  // Inicializar agregando clases de preparación
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
  });

  const animationObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Ejecutar animación
        const target = entry.target;
        target.style.opacity = '1';
        target.style.transform = 'translateY(0)';
        // Dejar de observar una vez animado
        observer.unobserve(target);
      }
    });
  }, {
    threshold: 0.1, // Disparar cuando el 10% del elemento sea visible
    rootMargin: '0px 0px -50px 0px' // Margen de disparo cómodo
  });

  animatedElements.forEach(el => animationObserver.observe(el));
});
