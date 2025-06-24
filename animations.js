// Smoothly fade in any element
function fadeIn(element, duration = 800) {
    element.style.opacity = 0;
    element.style.display = 'block';
  
    let last = +new Date();
    const tick = function () {
      element.style.opacity = +element.style.opacity + (new Date() - last) / duration;
      last = +new Date();
  
      if (+element.style.opacity < 1) {
        requestAnimationFrame(tick);
      }
    };
    tick();
  }
  
  // Smoothly fade out any element
  function fadeOut(element, duration = 800) {
    element.style.opacity = 1;
  
    let last = +new Date();
    const tick = function () {
      element.style.opacity = +element.style.opacity - (new Date() - last) / duration;
      last = +new Date();
  
      if (+element.style.opacity > 0) {
        requestAnimationFrame(tick);
      } else {
        element.style.display = 'none';
      }
    };
    tick();
  }
  
  // Example: Animate page load
  document.addEventListener("DOMContentLoaded", () => {
    const menuBox = document.querySelector('.menu-box');
    if (menuBox) fadeIn(menuBox, 1200);
  });
  