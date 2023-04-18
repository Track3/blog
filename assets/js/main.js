/**
 * Utils
 */

// addEventListener Helper
//
const listen = (ele, e, callback) => {
  if (ele !== null) {
    ele.addEventListener(e, callback);
  }
}

/**
 * Functions
 */

// Set inner width into CSS variable
//
function setVw() {
  let vw = document.documentElement.clientWidth / 100;
  document.documentElement.style.setProperty('--vw', `${vw}px`);
}

setVw();
window.addEventListener('resize', setVw);


// ToC toggle
//
function toggleToc() {
  const toc = document.getElementById('toc');
  if (toc.style.display === 'block') {
    toc.style.display = 'none';
  } else {
    toc.style.display = 'block';
  }
}

listen(document.getElementById('toc-btn'), 'click', toggleToc);


// Scroll to Top
//
const scrollBtn = document.getElementById('scroll-top-btn');
const toggleScrollTopBtn = () => {
  if ((window.scrollY > 400) && (window.innerWidth >= 1530)) {
    scrollBtn.style.display = 'block';
  } else {
    scrollBtn.style.display = 'none';
  }
}

listen(scrollBtn, 'click', () => {
  window.scrollTo(0, 0);
});

if (scrollBtn !== null) {
  window.addEventListener('scroll', () => {
    toggleScrollTopBtn();
  });
}

// Anchor points for list page
//
document.querySelectorAll('.post-year').forEach((ele) => {
  ele.addEventListener('click', () => {
    window.location.hash = '#' + ele.id;
  });
});
