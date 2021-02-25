// @ts-check

import { API_EVENT_TYPE } from "./api.js";

const messagesDiv = document.getElementById("messages");
const animatedGiftDiv = document.getElementById("animatedGift");

/**
 * @param {import('./api').APIEvent} event
 */
export function generateMessageDiv(event) {
  
  const userImageDiv = document.createElement("div");
  userImageDiv.className = "userImage";
  userImageDiv.style.backgroundImage = `url('${event.data.profile_picture_url}')`;
  
  const userDiv = document.createElement("div");
  userDiv.className = "user";
  userDiv.appendChild(userImageDiv);
  userDiv.appendChild(document.createTextNode(" "+ event.data.username));
  
  const message = document.createElement("div");
  message.className = "message animated " + event.type;
  message.appendChild(userDiv);
  message.appendChild(document.createTextNode(" "+ event.data.message));
  
  return message;
}

/**
 * @param {import('./api').APIEvent} event
 */
export function addMessage(event) {
  if(event == null) {
    throw "null event";
  }
  
  for (let index = 0; index < messagesDiv.children.length; index++) {
    messagesDiv.children[index].classList.remove("animated");
  }
  
  messagesDiv.prepend(generateMessageDiv(event));
  
  for (let index = messagesDiv.children.length-1; index >= 1; index--) {
    /** @type {HTMLDivElement} */
    // @ts-ignore
    const element = messagesDiv.children[index];
    
    let visiblePx = element.offsetHeight + element.offsetTop + 8; // height + top + vertical margin
    if(visiblePx < 28) { // half line + bottom padding + bottom margin
      element.remove();
    }
  }
}

/** @type {number} */
let lastAnimationEnd = null;

/**
 * Helper function to check against expected gift animation duration.
 */
export function isPossiblyAnimatingGift() {
  return lastAnimationEnd != null && lastAnimationEnd >= Date.now();
}

/**
 * Helper function to check actual UI animation state.
 * Takes about 10 times longer compared to isPossiblyAnimatingGift. Still takes less than 0.1 ms.
 */
export function isAnimatingGiftUI() {
  // NOTE: Only works since the fadeInOut keyframes start with 0.01
  return window.getComputedStyle(animatedGiftDiv).getPropertyValue("opacity") != "0"
}

// NOTE: Matches css.
const ANIMATION_DURATION = 2000;

/**
 * @param {import('./api').APIEvent} event
 */
export function animateGift(event) {
  if(event == null) {
    throw "null event";
  } else if(event.type != API_EVENT_TYPE.ANIMATED_GIFT) {
    throw "wrong type event:" + JSON.stringify(event);
  }
  
  // Setting animation start prematurely for isPossiblyAnimatingGift.
  lastAnimationEnd = Date.now() + ANIMATION_DURATION;
  
  animatedGiftDiv.classList.remove("animated");
  
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      
      animatedGiftDiv.innerText = event.data.gift_emoji;
      
      lastAnimationEnd = Date.now() + ANIMATION_DURATION;
      
      animatedGiftDiv.classList.add("animated");
    })
  })
}
