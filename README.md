# videojs-fmp4

VideoJS Tech to play fragmented mp4 files live

## Installation

```sh
npm install --save videojs-fmp4
```

## Usage

To include videojs-fmp4 on your website or web application, use any of the following methods.

### `<script>` Tag

This is the simplest case. Get the script in whatever way you prefer and include the plugin _after_ you include [video.js][videojs], so that the `videojs` global is available.

```html
<script src="//path/to/video.min.js"></script>
<script src="//path/to/videojs-fmp4.min.js"></script>
<script>
  var player = videojs('my-video');

  player.fmp4();
</script>
```

### Browserify/CommonJS

When using with Browserify, install videojs-fmp4 via npm and `require` the plugin as you would any other module.

```js
var videojs = require('video.js');

// The actual plugin function is exported by this module, but it is also
// attached to the `Player.prototype`; so, there is no need to assign it
// to a variable.
require('videojs-fmp4');

var player = videojs('my-video');

player.fmp4();
```

### RequireJS/AMD

When using with RequireJS (or another AMD library), get the script in whatever way you prefer and `require` the plugin as you normally would:

```js
require(['video.js', 'videojs-fmp4'], function(videojs) {
  var player = videojs('my-video');

  player.fmp4();
});
```

## License

Apache-2.0. Copyright (c) Chris Wiggins &lt;chris@wiggins.nz&gt;


[videojs]: http://videojs.com/
