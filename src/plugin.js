import videojs from 'video.js';
import {version as VERSION} from '../package.json';


// Default options for the plugin.
const defaults = {};

// Cross-compatibility for Video.js 5 and 6.
const registerPlugin = videojs.registerPlugin || videojs.plugin;
// const dom = videojs.dom || videojs;

const Tech = videojs.getComponent('Tech');
const Html5 = videojs.getTech('Html5');

const createTimeRange = videojs.createTimeRange;

class Fmp4 extends Html5 {

 /**
  * Create an instance of this Tech.
  *
  * @param {Object} [options]
  *        The key/value store of player options.
  *
  * @param {Component~ReadyCallback} ready
  *        Callback function to call when the `Flash` Tech is ready.
  */
  constructor(options, ready) {
    super(options, ready);

    console.log('construct');

    this.queue_ = [];

    this.triggerReady();
  }

  initMp4Box(){
  	this.mp4Box_ = new MP4Box();
  	this.nextFileStart_ = 0;

  	//Set up MP4Box listeners
    ['onReady', 'onSegment'].forEach((fnName) => {
    	this.mp4Box_[fnName] = this['mp4'+fnName].bind(this);
    });
  }

  mp4onReady(info){
  	console.log('mp4ready', info, this);


  	this.mp4info_ = info;

	this.mp4Box_.setSegmentOptions(info.tracks[0].id, '1', {nbSamples: 3});
    this.mp4initSegs_ = this.mp4Box_.initializeSegmentation();

    this.initSourceBuffer_();
    this.mp4Box_.start();
  }

  mp4onSegment(id, user, buf){
    if(this.videoSourceBuffer_.updating || this.queue_.length > 0){
        this.queue_.push(buf);
    }else{
        this.videoSourceBuffer_.appendBuffer(buf);

        if(this.el_.paused){
            this.el_.play();
            this.el_.currentTime = 0;
        }
    }
  }

  initSourceBuffer_(info, initSegs){
  	this.videoSourceBuffer_ = this.mediaSource_.addSourceBuffer('video/mp4;codecs="'+ this.mp4info_.tracks[0].codec +'"');
  	this.videoSourceBuffer_.appendBuffer(this.mp4initSegs_[0].buffer);

  	//Set up MP4Box listeners
    ['updateend', 'update'].forEach((fnName) => {
    	this.videoSourceBuffer_[fnName] = this['sourceBuffer'+fnName].bind(this);
    });

    this.videoSourceBuffer_.addEventListener('abort', function(){
        console.log('abort');
    });

    this.videoSourceBuffer_.addEventListener('error', console.error);
  }

  sourceBufferupdateend(){
  	if(this.el_.currentTime === 0 && this.el_.seekable.length > 0){
      this.el_.currentTime = this.el_.seekable.end(0) - 0.1;
    }

    if(this.el_.paused){
        console.log('paused');
        this.el_.play();
        this.el_.currentTime = 0;
    }
  }

  sourceBufferupdate(){
  	if(this.queue_.length > 0 && !this.videoSourceBuffer_.updating){
        videoSourceBuffer_.appendBuffer(this.queue_.shift());
    }
  }

  mediaSourceOpen(){
  	console.log('sourceOpen');
  	this.initMp4Box.call(this);

  	var socket = io('http://localhost:3000', {
        transports: ['websocket']
    });

    socket.on('connect', () => {
    	console.log('connect');
    	socket.emit('startStreaming');

        socket.on('videoData', (msg) => {
        	console.log('videoData');

            msg.fileStart = this.nextFileStart_;
            this.nextFileStart_ = this.mp4Box_.appendBuffer(msg);
        });
    });
  }

  //createEl created by the Html5 tech super

  /**
   * Called by {@link Player#play} to play using the `Flash` `Tech`.
   */
  play() {
  	console.log('play')
    //Start the streaming
    this.mediaSource_ = new MediaSource();
    
    this.el_.src = URL.createObjectURL(this.mediaSource_);
    this.mediaSource_.addEventListener('sourceopen', this.mediaSourceOpen.bind(this));
  }

  /**
   * Called by {@link Player#pause} to pause using the `Flash` `Tech`.
   */
  pause() {
  	console.log('pause');
  }

  /**
   * A getter/setter for the `Flash` Tech's source object.
   * > Note: Please use {@link Flash#setSource}
   *
   * @param {Tech~SourceObject} [src]
   *        The source object you want to set on the `Flash` techs.
   *
   * @return {Tech~SourceObject|undefined}
   *         - The current source object when a source is not passed in.
   *         - undefined when setting
   *
   * @deprecated Since version 5.
   */
  src(src) {
    if (src === undefined) {
      return this.currentSrc();
    }

    // Setting src through `src` not `setSrc` will be deprecated
    return this.setSrc(src);
  }

  /**
   * A getter/setter for the `Flash` Tech's source object.
   *
   * @param {Tech~SourceObject} [src]
   *        The source object you want to set on the `Flash` techs.
   */
  setSrc(src) {
    // Make sure source URL is absolute.
    console.log(src);
    // Currently the SWF doesn't autoplay if you load a source later.
    // e.g. Load player w/ no source, wait 2s, set src.
    if (this.autoplay()) {
      this.setTimeout(() => this.play(), 0);
    }
  }

  /**
   * Indicates whether the media is currently seeking to a new position or not.
   *
   * @return {boolean}
   *         - True if seeking to a new position
   *         - False otherwise
   */
  seeking() {
    return this.lastSeekTarget_ !== undefined;
  }

  /**
   * Returns the current time in seconds that the media is at in playback.
   *
   * @param {number} time
   *        Current playtime of the media in seconds.
   */
  setCurrentTime(time) {
    try {
      this.el_.currentTime = seconds;
    } catch (e) {
      log(e, 'Video is not ready. (Video.js)');
      // this.warning(VideoJS.warnings.videoNotReady);
    }
  }

  /**
   * Get the current playback time in seconds
   *
   * @return {number}
   *         The current time of playback in seconds.
   */
  /*currentTime() {
    // when seeking make the reported time keep up with the requested time
    // by reading the time we're seeking to
    if (this.seeking()) {
      return this.lastSeekTarget_ || 0;
    }
    return this.el_.vjs_getProperty('currentTime');
  }*/

  /**
   * Get the current source
   *
   * @method currentSrc
   * @return {Tech~SourceObject}
   *         The current source
   */
  currentSrc() {
    if (this.currentSource_) {
      return this.currentSource_.src;
    }
    return this.el_.currentSrc;
  }

  /**
   * Get the total duration of the current media.
   *
   * @return {number}
   8          The total duration of the current media.
   */
  duration() {
  	//TODO
    return Infinity;
  }

  /**
   * Load media into Tech.
   */
  load() {
    //this.el_.vjs_load();
  }

  /**
   * Get the poster image that was set on the tech.
   */
  poster() {
    
  }

  /**
   * Poster images are not handled by the Flash tech so make this is a no-op.
   */
  setPoster() {}

  /**
   * Determine the time ranges that can be seeked to in the media.
   *
   * @return {TimeRange}
   *         Returns the time ranges that can be seeked to.
   */
  seekable() {
  	console.log('seekable');
  	//return;
    return this.el_.seekable;
  }

  /**
   * Get and create a `TimeRange` object for buffering.
   *
   * @return {TimeRange}
   *         The time range object that was created.
   */
  buffered() {
  	console.log('buffered');
  	console.log(this.el_.buffered.end(0));
    return this.el_.buffered;
    return;
  }

  /**
   * Get fullscreen support -
   *
   * Flash does not allow fullscreen through javascript
   * so this always returns false.
   *
   * @return {boolean}
   *         The Flash tech does not support fullscreen, so it will always return false.
   */
  supportsFullScreen() {
    // Flash does not allow fullscreen through javascript
    return false;
  }

  /**
   * Flash does not allow fullscreen through javascript
   * so this always returns false.
   *
   * @return {boolean}
   *         The Flash tech does not support fullscreen, so it will always return false.
   */
  enterFullScreen() {
    return false;
  }
}

Fmp4.isSupported = function(){
	return true;
}

// Add Source Handler pattern functions to this tech
Tech.withSourceHandlers(Fmp4);

/*
 * Native source handler for flash,  simply passes the source to the swf element.
 *
 * @property {Tech~SourceObject} source
 *           The source object
 *
 * @property {Flash} tech
 *           The instance of the Flash tech
 */
Fmp4.nativeSourceHandler = {};

/**
 * Check if the Flash can play the given mime type.
 *
 * @param {string} type
 *        The mimetype to check
 *
 * @return {string}
 *         'maybe', or '' (empty string)
 */
Fmp4.nativeSourceHandler.canPlayType = function(type) {
  console.log(type);
  if (true) {
    return 'maybe';
  }

  return '';
};

/**
 * Check if the media element can handle a source natively.
 *
 * @param {Tech~SourceObject} source
 *         The source object
 *
 * @param {Object} [options]
 *         Options to be passed to the tech.
 *
 * @return {string}
 *         'maybe', or '' (empty string).
 */
Fmp4.nativeSourceHandler.canHandleSource = function(source, options) {
	if(source.type === 'video/fmp4') return true;
	return false;
};

/**
 * Pass the source to the swf.
 *
 * @param {Tech~SourceObject} source
 *        The source object
 *
 * @param {Flash} tech
 *        The instance of the Flash tech
 *
 * @param {Object} [options]
 *        The options to pass to the source
 */
Fmp4.nativeSourceHandler.handleSource = function(source, tech, options) {
  tech.setSrc(source.src);
};

/**
 * noop for native source handler dispose, as cleanup will happen automatically.
 */
Fmp4.nativeSourceHandler.dispose = function() {};

// Register the native source handler
Fmp4.registerSourceHandler(Fmp4.nativeSourceHandler);

videojs.registerTech('Fmp4', Fmp4);

export default Fmp4;
