"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./HeroVideo.module.scss";

const YOUTUBE_ORIGIN = "https://www.youtube-nocookie.com";
const PLAYING = 1;
const PAUSED = 2;

function embedUrl(id) {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    loop: "1",
    playlist: id, // `loop` needs the id repeated as a one-item playlist
    controls: "0",
    playsinline: "1",
    rel: "0",
    disablekb: "1",
    fs: "0",
    iv_load_policy: "3",
    modestbranding: "1",
    enablejsapi: "1",
    origin: window.location.origin,
  });
  return `${YOUTUBE_ORIGIN}/embed/${encodeURIComponent(id)}?${params}`;
}

/** Player state from a YouTube iframe message, or undefined. */
function playerState(data) {
  if (data?.event === "onStateChange") return data.info;
  if (data?.event === "infoDelivery") return data.info?.playerState;
  return undefined;
}

function shouldPlay() {
  return (
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    !navigator.connection?.saveData
  );
}

/**
 * Home hero background: the live YouTube film (privacy-enhanced embed,
 * muted, looping, no controls, inline on phones) covering the hero at 16:9,
 * under the 40% black overlay.
 *
 * The poster still is what the server renders and what stays when the film
 * cannot play: the embed is mounted only after the page has loaded, never
 * under prefers-reduced-motion or Save-Data, and it fades in only once the
 * player reports that it is playing (a blocked or failing embed never covers
 * the poster). A pause/play button appears while the film runs (WCAG 2.2.2).
 *
 * @param {{ youtubeId: string, poster: import("@/lib/block57/assets").Block57Asset,
 *   pauseLabel: string, playLabel: string }} props
 */
export default function HeroVideo({
  youtubeId,
  poster,
  pauseLabel,
  playLabel,
}) {
  const frameRef = useRef(null);
  const listenTimer = useRef(0);
  const [src, setSrc] = useState(null);
  const [state, setState] = useState(null); // null | PLAYING | PAUSED

  // Mount the embed once the page has loaded (the poster stays the LCP).
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer;
    const mount = () => {
      timer = window.setTimeout(() => {
        if (shouldPlay()) setSrc(embedUrl(youtubeId));
      }, 300);
    };
    const onMotionChange = () => {
      if (reduce.matches) {
        setSrc(null);
        setState(null);
      } else {
        mount();
      }
    };

    if (document.readyState === "complete") mount();
    else window.addEventListener("load", mount, { once: true });
    reduce.addEventListener("change", onMotionChange);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("load", mount);
      reduce.removeEventListener("change", onMotionChange);
    };
  }, [youtubeId]);

  // Follow the player state (same messages the YouTube IFrame API uses).
  useEffect(() => {
    if (!src) return undefined;
    const onMessage = (event) => {
      const frame = frameRef.current;
      if (
        event.origin !== YOUTUBE_ORIGIN ||
        event.source !== frame?.contentWindow
      ) {
        return;
      }
      let data = event.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }
      window.clearTimeout(listenTimer.current); // the player is talking
      const next = playerState(data);
      if (next === PLAYING || next === PAUSED) setState(next);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [src]);

  const post = (message) => {
    frameRef.current?.contentWindow?.postMessage(
      JSON.stringify(message),
      YOUTUBE_ORIGIN,
    );
  };

  // Ask the player to report its state; it answers only once it is ready,
  // so repeat for a few seconds (as the IFrame API does).
  const handleLoad = () => {
    window.clearTimeout(listenTimer.current);
    let tries = 0;
    const listen = () => {
      post({ event: "listening", id: youtubeId, channel: "widget" });
      tries += 1;
      if (tries < 40) listenTimer.current = window.setTimeout(listen, 250);
    };
    listen();
  };

  useEffect(() => () => window.clearTimeout(listenTimer.current), []);

  const toggle = () => {
    const pause = state === PLAYING;
    post({
      event: "command",
      func: pause ? "pauseVideo" : "playVideo",
      args: [],
    });
    setState(pause ? PAUSED : PLAYING);
  };

  return (
    <div className={styles.media}>
      <Image
        src={poster.src}
        alt=""
        fill
        preload
        sizes="100vw"
        className={styles.poster}
      />
      {src ? (
        <div
          className={styles.frame}
          data-visible={state ? "true" : "false"}
          aria-hidden="true"
          inert
        >
          <iframe
            ref={frameRef}
            src={src}
            title="Block 57 background film"
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            tabIndex={-1}
            onLoad={handleLoad}
            className={styles.iframe}
          />
        </div>
      ) : null}
      <span className={styles.overlay} aria-hidden="true" />
      {state ? (
        <button
          type="button"
          className={styles.toggle}
          onClick={toggle}
          aria-label={state === PLAYING ? pauseLabel : playLabel}
        >
          <span
            aria-hidden="true"
            className={state === PLAYING ? styles.pauseIcon : styles.playIcon}
          />
        </button>
      ) : null}
    </div>
  );
}
