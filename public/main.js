// @ts-check

import { APIWrapper, API_EVENT_TYPE } from "./api.js";
import {
  addMessage,
  animateGift,
  isPossiblyAnimatingGift,
  isAnimatingGiftUI,
} from "./dom_updates.js";

const api = new APIWrapper();
let allEvents = [];

const deleteOldEvents = () => {
  const validDate = new Date();
  validDate.setSeconds(validDate.getSeconds() - 20);

  allEvents = allEvents.filter((e) => {
    return e.timestamp.getTime() > validDate.getTime();
  });
};

const sortFirstAnimatedGiftEvents = () => {
  allEvents.sort((a, b) => {
    if (a.type === API_EVENT_TYPE.ANIMATED_GIFT) {
      return -1;
    }
    if (b.type === API_EVENT_TYPE.ANIMATED_GIFT) {
      return 1;
    }
    return 0;
  });
};

const showEvent = (event) => {
  switch (event.type) {
    case API_EVENT_TYPE.ANIMATED_GIFT:
      addMessage(event);
      animateGift(event);
      break;
    case API_EVENT_TYPE.MESSAGE:
    case API_EVENT_TYPE.GIFT:
      addMessage(event);
      break;
  }
};

setInterval(() => {
  if (allEvents.length === 0) return;

  deleteOldEvents();
  sortFirstAnimatedGiftEvents();

  let event,
    showIndex = 0;

  if (isAnimatingGiftUI()) {
    event = allEvents.find((e, i) => {
      showIndex = i;
      return e.type !== API_EVENT_TYPE.ANIMATED_GIFT;
    });
  } else {
    event = allEvents[0];
  }
  if (event === undefined) return;

  showEvent(event);

  allEvents.splice(showIndex, 1);
}, 500);

api.setEventHandler((events) => {
  if (events.length === 0) return;
  allEvents = allEvents.concat(events);
});
