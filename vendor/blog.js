/**
 * Created by fritx on 5/7/14.
 */

(function () {

  var pageBase = 'p/';
  var pageExt = 'md';
  var mainPage = resolve(
    location.search.slice(1)
      .replace(new RegExp('&.*'), '') || 'diary'
  );
  var mainTitle = '';

// Optional disqus - see: https://disqus.com/
  var onlineUrl = 'http://fritx.github.io/blog/?' + mainPage;
  var disqusShortname = 'fritx-blog';


  function config() {
    marked.setOptions({
      renderer: new marked.Renderer(),
      gfm: true,
      tables: true,
      breaks: false,
      pedantic: false,
      sanitize: false,
      smartLists: true,
      smartypants: false
    });
  }

  function render(data, options, callback) {
    marked(data, options, callback);
  }

  function load(sel, page, isMain, options, callback) {
    isMain = isMain || false;
    var url = pageBase + page + '.' + pageExt;
    $.ajax({
      url: url,
      error: onNotFound,
      success: function (data) {
        render(data, options, function (err, html) {
          if (err && callback) return callback(err);
          var $el = $(sel);
          $el.attr('data-loaded', true).hide().html(html);

          $el.find('[src]').each(function () {
            var $el = $(this);
            $el.attr('src', function (x, old) {
              if (isAbsolute(old)) {
                return old;
              }
              return resolve(
                url.replace(
                  new RegExp('[^\\/]*$', 'g'), ''
                ) + old
              );
            });
          });

          $el.find('[href]').each(function () {
            var $el = $(this);
            $el.attr('href', function (x, old) {
              if (isAbsolute(old)) {
                $el.attr('target', '_blank');
                return old;
              }
              var prefixed = resolve(
                url.replace(
                  new RegExp('^' + pageBase + '|[^\\/]*$', 'g'), ''
                ) + old
              );
              var regExt = new RegExp('\\.' + pageExt + '$');
              if (!regExt.test(old)) {
                if (!/(^\.|\/\.?|\.html?)$/.test(old)) {
                  $el.attr('target', '_blank');
                }
                return prefixed;
              }
              return '?' + prefixed.replace(regExt, '');
            });
          });

          $el.find('p').each(function () {
            var $el = $(this);
            $el.html(function (x, old) {
              return old.replace(/\n+/g, '');
            });
          });

          if (isMain) {
            mainTitle = $el.find('h1:first').text();
            $('title').text(function (x, old) {
              return mainTitle + ' - ' + old;
            });

            // CONFIGURATION VARIABLES: EDIT BEFORE PASTING INTO YOUR WEBPAGE
            window.disqus_shortname = disqusShortname;
            window.disqus_title = mainTitle;
            window.disqus_identifier = mainPage;
            window.disqus_url = onlineUrl;

            // DON'T EDIT BELOW THIS LINE
            (function () {
              var dsq = document.createElement('script');
              dsq.async = true;
              dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
              document.getElementsByTagName('body')[0].appendChild(dsq);
            })();
          }

          $el.show();
          if (callback) callback();
        });
      }
    });
  }

  function onNotFound() {
    if (!$('#main-page').attr('data-loaded')) location.href = '.';
  }

  function start() {
    load('#sidebar-page', 'sidebar');
    load('#main-page', mainPage, true);
  }

  function isAbsolute(url) {
    return !url.indexOf('//') || !!~url.indexOf('://');
  }

  function resolve(path) {
    var segs = path.split('/');
    var buf = [];
    for (var i = 0; i < segs.length; i++) {
      var seg = segs[i];
      if (seg === '.') continue;
      var last = buf[buf.length - 1];
      if (seg === '..' && last && last !== '..') {
        buf.pop();
        continue;
      }
      buf.push(seg);
    }
    return buf.join('/');
  }


  config();
  start();

})();
