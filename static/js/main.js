// Auto Hide Header
//
let lastScrollPosition = window.pageYOffset;
let header = document.getElementById('site-header');

const autoHideHeader = () => {
  let currentScrollPosition = window.pageYOffset;
  if (currentScrollPosition > lastScrollPosition) {
    header.classList.remove('slideInUp');
    header.classList.add('slideOutDown');
  }
  else {
    header.classList.remove('slideOutDown');
    header.classList.add('slideInUp');
  }
  lastScrollPosition = currentScrollPosition;
}

// Mobile Menu Toggle
//
let mobileMenu = document.getElementById('mobile-menu');

if (haveHeader == true) {
  document.getElementById('menu-btn').addEventListener('click', () => {
    if (mobileMenu.style.display == 'none') {
      mobileMenu.style.display = 'block';
    } else {
      mobileMenu.classList.remove('bounceInRight');
      mobileMenu.classList.add('bounceOutRight');
      setTimeout(() => {
        mobileMenu.style.display = 'none';
        mobileMenu.classList.remove('bounceOutRight');
        mobileMenu.classList.add('bounceInRight');
      }, 750);
    }
  });
}

// Show Featured Image
//
const showFeaturedImg = () => {
  document.getElementById('bg-img').classList.add('show-bg-img');
}

const showContent = () => {
  document.getElementById('bg-img').classList.remove('show-bg-img');
}

//Load Comments
//
let commentsLoaded = false;
let comments = document.getElementById('comments');
let commentsLoader = document.getElementById('comments-loader');

const avJsUrl = '//cdn1.lncld.net/static/js/3.0.4/av-min.js';
const valineJsUrl = '//unpkg.com/valine@1.1.9/dist/Valine.min.js';

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

        if (isAbort) { reject(); } else { resolve(); }
      }
    }

    script.onload = onloadHander;
    script.onreadystatechange = onloadHander;

    script.src = source;
    prior.parentNode.insertBefore(script, prior);
  });
}
const loadComments = () => {
  loadScript(avJsUrl).then(() => {
    loadScript(valineJsUrl).then(() => {
      new Valine({
        el: '#comments',
        appId: 'QfBLso0johYg7AXtV9ODU6FC-gzGzoHsz',
        appKey: 'J1tpEEsENa48aLVsPdvwMP14',
        placeholder: '说点什么吧',
        verify: true
      });
      commentsLoader.style.display = 'none';
    }, () => {
      console.log('Failed to Load Valine.min.js');
    });
  }, () => {
    console.log('Failed to Load av-min.js');
  });
}

// Load comments if the window is not scrollable
if ((haveComments == true) && (comments.offsetTop < window.innerHeight)) {
  commentsLoader.style.display = 'block';
  loadComments();
  commentsLoaded = true;
}

window.addEventListener('scroll', () => {
  if (haveHeader == true) {
    autoHideHeader();
    mobileMenu.style.display = 'none'; //Hide Mobile Menu When Scroll
  }

  if ((haveComments == true) && (commentsLoaded == false)) {
    if (window.pageYOffset + window.innerHeight > comments.offsetTop) {
      commentsLoader.style.display = 'block';
      loadComments();
      commentsLoaded = true;
    }
  }
});
