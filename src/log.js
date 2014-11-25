/*jshint undef:false */
var isBrowser = (typeof window !== 'undefined') && (typeof window.history !== 'undefined') && (typeof window.navigator !== 'undefined');
var minilog = isBrowser ? require( 'minilog/lib/web/index.js') : require('minilog');
var log = minilog('app');
minilog.enable();

module.exports = log;