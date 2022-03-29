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

const toggleToc = () => {
  const toc = document.getElementById('toc');
  if (toc.style.display === 'block') {
    toc.style.display = 'none';
  } else {
    toc.style.display = 'block';
  };
}

listen ("#toc-btn", "click", toggleToc);


// Anchor points for list page
//
document.querySelectorAll('.post-year').forEach((ele)=> {
  ele.addEventListener('click', () => {
    window.location.hash = '#' + ele.id;
  });
});

// Load Comments
//
let commentsLoaded = false;
let comments = document.getElementById('comments');
let commentsLoader = document.getElementById('comments-loader');

const valineJsUrl = 'https://cdn.jsdelivr.net/npm/valine@1.4.18/dist/Valine.min.js';

const loadComments = () => {
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
}

window.addEventListener('scroll', throttle(() => {
  if ((comments !== null) && (commentsLoaded == false)) {
    if (window.pageYOffset + window.innerHeight > comments.offsetTop) {
      commentsLoader.style.display = 'block';
      loadComments();
      commentsLoaded = true;
    }
  }
}, 250));

// Load comments if the window is not scrollable
if ((comments !== null) && (comments.offsetTop < window.innerHeight)) {
  commentsLoader.style.display = 'block';
  loadComments();
  commentsLoaded = true;
};
