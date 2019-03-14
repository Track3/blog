/**
 * Utils
 */

// Load and run script via AJAX
//
const loadScript = (source, beforeEl, async = true, defer = true) => {
  return new Promise((resolve, reject) => {
    let script = document.createElement('script');
    const prior = beforeEl || document.getElementsByTagName('script')[0];

    script.async = async;
    script.defer = defer;

    function onloadHander(_, isAbort) {
      if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {
        script.onload = null;
        script.onreadystatechange = null;
        script = undefined;

        if (isAbort) {
          reject();
        } else {
          resolve();
        }
      }
    }

    script.onload = onloadHander;
    script.onreadystatechange = onloadHander;

    script.src = source;
    prior.parentNode.insertBefore(script, prior);
  });
}

// Throttle
//
const throttle = (callback, limit) => {
  let timeoutHandler = null;
  return () => {
    if (timeoutHandler == null) {
      timeoutHandler = setTimeout(() => {
        callback();
        timeoutHandler = null;
      }, limit);
    }
  };
};

// addEventListener Helper
//
const listen = (ele, e, callback) => {
  if (document.querySelector(ele) !== null) {
    document.querySelector(ele).addEventListener(e, callback);
  }
}

/**
 * Functions
 */

// Auto Hide Header
//
let header = document.getElementById('site-header');
let lastScrollPosition = window.pageYOffset;

const autoHideHeader = () => {
  let currentScrollPosition = window.pageYOffset;
  if (currentScrollPosition > lastScrollPosition) {
    header.classList.remove('slideInUp');
    header.classList.add('slideOutDown');
  } else {
    header.classList.remove('slideOutDown');
    header.classList.add('slideInUp');
  }
  lastScrollPosition = currentScrollPosition;
}

// Mobile Menu Toggle
//
let mobileMenuVisible = false;

const toggleMobileMenu = () => {
  let mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenuVisible == false) {
    mobileMenu.style.animationName = 'bounceInRight';
    mobileMenu.style.webkitAnimationName = 'bounceInRight';
    mobileMenu.style.display = 'block';
    mobileMenuVisible = true;
  } else {
    mobileMenu.style.animationName = 'bounceOutRight';
    mobileMenu.style.webkitAnimationName = 'bounceOutRight'
    mobileMenuVisible = false;
  }
}

// Featured Image Toggle
//
const showImg = () => {
  document.querySelector('.bg-img').classList.add('show-bg-img');
}

const hideImg = () => {
  document.querySelector('.bg-img').classList.remove('show-bg-img');
}

// ToC Toggle
//
const toggleToc = () => {
  document.getElementById('toc').classList.toggle('show-toc');
}

//Load Comments
//
let commentsLoaded = false;
let comments = document.getElementById('comments');
let commentsLoader = document.getElementById('comments-loader');

const avJsUrl = '//cdn.jsdelivr.net/npm/leancloud-storage@3.11.1/dist/av-min.js';
const valineJsUrl = 'https://cdn.jsdelivr.net/npm/valine@1.3.4/dist/Valine.min.js';

const loadComments = () => {
  loadScript(avJsUrl).then(() => {
    loadScript(valineJsUrl).then(() => {
      new Valine({
        el: '#comments',
        appId: 'QfBLso0johYg7AXtV9ODU6FC-gzGzoHsz',
        appKey: 'J1tpEEsENa48aLVsPdvwMP14',
        placeholder: '说点什么吧'
      });
      commentsLoader.style.display = 'none';
    }, () => {
      console.log('Failed to Load Valine.min.js');
    });
  }, () => {
    console.log('Failed to Load av-min.js');
  });
}


if (header !== null) {
  listen('#menu-btn', "click", toggleMobileMenu);
  listen('#toc-btn', "click", toggleToc);
  listen('#img-btn', "click", showImg);
  listen('.bg-img', "click", hideImg);

  // Load comments if the window is not scrollable
  if ((comments !== null) && (comments.offsetTop < window.innerHeight)) {
    commentsLoader.style.display = 'block';
    loadComments();
    commentsLoaded = true;
  }

  window.addEventListener('scroll', throttle(() => {
    autoHideHeader();
    if (mobileMenuVisible == true) {
      toggleMobileMenu();
    }

    if ((comments !== null) && (commentsLoaded == false)) {
      if (window.pageYOffset + window.innerHeight > comments.offsetTop) {
        commentsLoader.style.display = 'block';
        loadComments();
        commentsLoaded = true;
      }
    }
  }, 250));
}
