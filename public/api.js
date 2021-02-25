// @ts-check

// @ts-ignore
// https://www.npmjs.com/package/seedrandom
!function(f,a,c){
  var s,l=256,p="random",d=c.pow(l,6),g=c.pow(2,52),y=2*g,h=l-1;function n(n,t,r){function e(){for(var n=u.g(6),t=d,r=0;n<g;)n=(n+r)*l,t*=l,r=u.g(1);for(;y<=n;)n/=2,t/=2,r>>>=1;return(n+r)/t}var o=[],i=j(function n(t,r){var e,o=[],i=typeof t;if(r&&"object"==i)for(e in t)try{o.push(n(t[e],r-1))}catch(n){}return o.length?o:"string"==i?t:t+"\0"}((t=1==t?{entropy:!0}:t||{}).entropy?[n,S(a)]:null==n?function(){try{var n;return s&&(n=s.randomBytes)?n=n(l):(n=new Uint8Array(l),(f.crypto||f.msCrypto).getRandomValues(n)),S(n)}catch(n){var t=f.navigator,r=t&&t.plugins;return[+new Date,f,r,f.screen,S(a)]}}():n,3),o),u=new m(o);return e.int32=function(){return 0|u.g(4)},e.quick=function(){return u.g(4)/4294967296},e.double=e,j(S(u.S),a),(t.pass||r||function(n,t,r,e){return e&&(e.S&&v(e,u),n.state=function(){return v(u,{})}),r?(c[p]=n,t):n})(e,i,"global"in t?t.global:this==c,t.state)}function m(n){var t,r=n.length,u=this,e=0,o=u.i=u.j=0,i=u.S=[];for(r||(n=[r++]);e<l;)i[e]=e++;for(e=0;e<l;e++)i[e]=i[o=h&o+n[e%r]+(t=i[e])],i[o]=t;(u.g=function(n){for(var t,r=0,e=u.i,o=u.j,i=u.S;n--;)t=i[e=h&e+1],r=r*l+i[h&(i[e]=i[o=h&o+t])+(i[o]=t)];return u.i=e,u.j=o,r})(l)}function v(n,t){return t.i=n.i,t.j=n.j,t.S=n.S.slice(),t}function j(n,t){for(var r,e=n+"",o=0;o<e.length;)t[h&o]=h&(r^=19*t[h&o])+e.charCodeAt(o++);return S(t)}function S(n){return String.fromCharCode.apply(0,n)}if(j(c.random(),a),"object"==typeof module&&module.exports){module.exports=n;try{s=require("crypto")}catch(n){}}else"function"==typeof define&&define.amd?define(function(){return n}):c["seed"+p]=n
}("undefined"!=typeof self?self:this,[],Math);

// Type Definitions //

/**
 * @callback APIEventHandler
 * @param {APIEvent[]} events
 * @returns {void}
 */

/**
 * @template {APIEventType} E
 * @template {APIEventData} K
 * @typedef APIEventTemplate
 * @property {string} id
 * @property {Date} timestamp
 * @property {E} type
 * @property {K} data
 */
/** @typedef {APIEventTemplate<"m", APIMessageEventData>} APIMessageEvent */
/** @typedef {APIEventTemplate<"g", APIGiftEventData>} APIGiftEvent */
/** @typedef {APIEventTemplate<"ag", APIGiftEventData>} APIAnimatedGiftEvent */
/** @typedef {APIMessageEvent|APIGiftEvent|APIAnimatedGiftEvent} APIEvent */

/**
 * @typedef APIMessageEventData
 * @property {string} username
 * @property {string} profile_picture_url
 * @property {string} message
 */
/**
 * @typedef APIGiftEventData
 * @property {string} username
 * @property {string} profile_picture_url
 * @property {string} message
 * @property {string} gift_emoji
 */
/** @typedef {APIMessageEventData|APIGiftEventData} APIEventData */

/** @typedef {"m"|"g"|"ag"} APIEventType */

/**
 * @callback RandomGenerator
 * @returns {number}
 */

// Main Exports //

/**
 * @type {{"MESSAGE": "m","GIFT": "g","ANIMATED_GIFT": "ag"}}
 */
export const API_EVENT_TYPE = Object.freeze({
  "MESSAGE": "m",
  "GIFT": "g",
  "ANIMATED_GIFT": "ag",
})

export class APIWrapper {
  constructor(seed=null, slowMode=false, possibleDuplicateEvent=false) {
    const that = this;
    
    /** @type {RandomGenerator} */
    // @ts-ignore
    that.random = new Math.seedrandom(seed);
    
    /** @type {APIEventHandler} */
    that.eventHandler = console.log;
    
    that.intervalID = setInterval(() => {
      // Debug hack
      if(window["stopAPI"]) return;
      
      if(that.random() > (slowMode ? 0.1 : 0.25)) return;
      
      const eventCount = Math.max(0, (slowMode ? 10 : 6) - Math.floor(that.random()*12));
      
      /** @type {APIEvent[]} */
      let events = [];
      
      for (let index = 0; index < eventCount; index++) {
        /** @type {APIEventType} */
        let eventType = (
          that.random() > 0.5 ?
          API_EVENT_TYPE.MESSAGE :
          (
            that.random() > 0.5 ?
            API_EVENT_TYPE.GIFT :
            API_EVENT_TYPE.ANIMATED_GIFT
          )
        );
        
        const randomUser = that._sample(USER_OPTIONS);
        
        let event_data;
        if(eventType == API_EVENT_TYPE.MESSAGE)
        {
          /** @type {APIMessageEventData} */
          event_data = {
            "username": randomUser.username,
            "profile_picture_url": randomUser.profile_picture_url,
            "message": that._sample(MESSAGE_OPTIONS),
          }
        }
        else
        {
          const randomGiftEmoji = that._sample(
            eventType == API_EVENT_TYPE.ANIMATED_GIFT ?
            ANIMATED_GIFT_OPTIONS :
            GIFT_OPTIONS
          );
          
          /** @type {APIGiftEventData} */
          event_data = {
            "username": randomUser.username,
            "profile_picture_url": randomUser.profile_picture_url,
            "message": `Sent you ${randomGiftEmoji}`,
            "gift_emoji": randomGiftEmoji,
          }
        }
        
        // @ts-ignore
        events.push({
          "id": (possibleDuplicateEvent ? that._notSoRandomID() : that._randomID()),
          "timestamp": new Date(Date.now() - Math.floor(10000*that.random())),
          "type": eventType,
          "data": event_data
        })
      }
      
      // Shuffling already out of order events.
      this._shuffle(events);
      
      if(that.eventHandler != null) {
        try {
          that.eventHandler(events);
        } catch (error) {
          console.error("eventHandler error", error);
        }
      }
      
    }, 200);
    
  }
  
  /**
   * @param {APIEventHandler} func 
   */
  setEventHandler(func) {
    this.eventHandler = func;
  }
  
  //
  
  _randomID(size=16) {
    return new Array(size).fill(null).map(() => {
      // @ts-ignore
      return this._sample(RANDOM_ID_CHARS);
    }).join('');
  }
  
  _notSoRandomID() {
    return new Array(2).fill(null).map(() => {
      // @ts-ignore
      return this._sample("0123456789");
    }).join('');
  }
  
  /**
   * @template E
   * @param {E[]|Readonly<E[]>} array
   * @returns {E}
   */
  _sample(array) {
    return array[Math.floor(this.random()*array.length)]
  }
  
  /**
   * Shuffles given array.
   * 
   * Uses Fisher–Yates Shuffle: http://bost.ocks.org/mike/shuffle/
   * @template E
   * @param {E[]} array
   * @returns {void}
   */
  _shuffle(array) {
    var m = array.length, t, i;
    while (m) {
      i = Math.floor(Math.random() * m--);
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }
  }
}

// Random Event Generation //

const RANDOM_ID_CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const ANIMATED_GIFT_OPTIONS = Object.freeze([
  "🎁",
  "💝",
  "📦",
])

const GIFT_OPTIONS = Object.freeze([
  "🐵",
  "🐶",
  "🦊",
  "🐱",
  "🦁",
  "🦄",
  "🐷",
  "🐏",
  "🐼",
  "🐻",
  "🍄",
])

const USER_OPTIONS = Object.freeze([
  {"username": "Jellyfists", "profile_picture_url": "/assets/pic1.png"},
  {"username": "Parasike", "profile_picture_url": "/assets/pic2.png"},
  {"username": "Porcupixel", "profile_picture_url": "/assets/pic3.png"},
  {"username": "Phantomb", "profile_picture_url": "/assets/pic4.png"},
  {"username": "LandBloodElf", "profile_picture_url": "/assets/pic5.png"},
  {"username": "LoyalZebra", "profile_picture_url": "/assets/pic6.png"},
  {"username": "GrumpyBloodElf", "profile_picture_url": "/assets/pic7.png"},
  {"username": "SilkMonkey", "profile_picture_url": "/assets/pic8.png"},
  {"username": "RedZebra", "profile_picture_url": "/assets/pic9.png"},
  {"username": "PerfectStitches", "profile_picture_url": "/assets/pic10.png"},
  {"username": "Mosquitoxic", "profile_picture_url": "/assets/pic11.png"},
  {"username": "Parasyclops", "profile_picture_url": "/assets/pic12.png"},
  {"username": "Flamingopher", "profile_picture_url": "/assets/pic13.png"},
  {"username": "FickleStalker", "profile_picture_url": "/assets/pic14.png"},
  {"username": "FurryProwler", "profile_picture_url": "/assets/pic15.png"},
  {"username": "BlandFroglet", "profile_picture_url": "/assets/pic16.png"},
  {"username": "LightningMosquito", "profile_picture_url": "/assets/pic17.png"},
  {"username": "FruitDutchess", "profile_picture_url": "/assets/pic18.png"},
  {"username": "ProudPeafowl", "profile_picture_url": "/assets/pic19.png"},
  {"username": "Lassassin", "profile_picture_url": "/assets/pic20.png"},
])

const MESSAGE_OPTIONS = Object.freeze([
  "Hi",
  "Hey",
  "Lorem ipsum dolor sit amet",
  "Consectetur adipiscing elit",
  "Cras accumsan ex eu risus cursus",
  "Id scelerisque orci molestie",
  "Praesent egestas tortor augue",
  "At fringilla libero tempor sed",
  "Etiam elementum vestibulum nunc",
  "Sed sagittis lectus placerat id",
  "Donec ut tellus odio",
  "Nam blandit placerat pulvinar",
  "Sed suscipit risus quis auctor tincidunt",
  "Nam volutpat lectus ac tortor convallis",
  "Pellentesque tristique odio imperdiet",
  "Integer fringilla elementum suscipit",
  "Mauris quam ligula",
  "Venenatis ut tristique eget",
  "Tempus ac sapien",
  "Fusce accumsan commodo risus",
  "In pulvinar turpis condimentum ac",
  "Vivamus massa ipsum",
  "Dignissim a blandit nec",
  "Bibendum non erat",
  "Pellentesque ut ultricies libero",
  "Suspendisse potenti",
  "Nunc",
]);

//
